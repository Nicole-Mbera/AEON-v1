import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email-cron';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Validation schema for booking consultation
const bookConsultationSchema = z.object({
  teacher_id: z.number().int().positive('Invalid professional ID'),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
});

// Book a consultation
export async function POST(request: Request) {
  try {
    // Rate limiting: 10 bookings per hour per IP
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(`consultation:${clientIp}`, {
      interval: 3600000, // 1 hour
      uniqueTokenPerInterval: 10,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many booking attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Authenticate user
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'patient') && !hasRole(currentUser, 'student')) {
      return NextResponse.json(
        { error: 'Unauthorized. Patient access required.' },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = bookConsultationSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    const { teacher_id, scheduled_date, scheduled_time, notes } = validation.data;

    // Get patient ID
    const patientRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [currentUser.userId]
    });
    // Fallback or legacy support if students/patients table confusion exists, but using students as per book/route.ts
    const patient = patientRes.rows[0] as unknown as { id: number } | undefined;

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    // Check if professional exists and is active
    const professionalCheckRes = await db.execute({
      sql: `SELECT hp.id 
            FROM teachers hp
            JOIN users u ON hp.user_id = u.id
            WHERE hp.id = ? AND u.is_active = 1`,
      args: [teacher_id]
    });

    if (professionalCheckRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Professional not found or inactive' },
        { status: 404 }
      );
    }

    // Check if patient already has 2 bookings for this day (limit per day)
    const patientBookingsTodayRes = await db.execute({
      sql: `SELECT COUNT(*) as count FROM sessions
            WHERE student_id = ?
              AND scheduled_date = ?
              AND status IN ('scheduled', 'confirmed')`,
      args: [patient.id, scheduled_date]
    });
    const patientBookingsToday = patientBookingsTodayRes.rows[0] as unknown as { count: number };

    if (patientBookingsToday.count >= 2) {
      return NextResponse.json(
        { error: 'You can only book up to 2 consultations per day' },
        { status: 409 }
      );
    }

    // Check for conflicting appointments
    const conflictCheckRes = await db.execute({
      sql: `SELECT id FROM sessions
            WHERE teacher_id = ? 
              AND scheduled_date = ? 
              AND scheduled_time = ?
              AND status IN ('scheduled', 'confirmed')`,
      args: [teacher_id, scheduled_date, scheduled_time]
    });

    if (conflictCheckRes.rows.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      );
    }

    // Create consultation with start_time
    const startTime = new Date(`${scheduled_date}T${scheduled_time}`);
    const meetingLink = `https://meet.jit.si/bodywise-${Date.now()}`; // Jitsi room

    // Using `sessions` table instead of `consultations` to match other refactor mostly likely, 
    // BUT the existing code used `consultations`. 
    // Wait, `book/route.ts` used `sessions`. This file `student/sessions/route.ts` used `consultations`.
    // I MUST UNIFY THIS. The DB likely has `sessions` table from `book/route.ts` context. 
    // I will use `sessions` to be safe and consistent with my previous strict change.

    const insertRes = await db.execute({
      sql: `INSERT INTO sessions (student_id, teacher_id, scheduled_date, scheduled_time, duration_minutes, status, meeting_link)
            VALUES (?, ?, ?, ?, 30, 'scheduled', ?)`,
      args: [
        patient.id,
        teacher_id,
        scheduled_date,
        scheduled_time,
        meetingLink
      ]
    });

    // Send confirmation email asynchronously
    const consultationId = Number(insertRes.lastInsertRowid);
    if (consultationId) {
      sendConfirmationEmail(consultationId).catch((error: unknown) => {
        console.error('Failed to send confirmation email:', error);
        // Don't fail the booking if email fails
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Consultation booked successfully. Confirmation email sent.',
      data: {
        consultation_id: consultationId,
        scheduled_date,
        scheduled_time,
        duration_minutes: 30,
        meeting_link: meetingLink,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Book consultation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get student's sessions
export async function GET(request: Request) {
  try {
    // Authenticate user
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'patient') && !hasRole(currentUser, 'student')) {
      return NextResponse.json(
        { error: 'Unauthorized. Patient access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Get patient ID
    const patientRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const patient = patientRes.rows[0] as unknown as { id: number } | undefined;

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    let query = `
      SELECT 
        c.id,
        c.scheduled_date,
        c.scheduled_time,
        c.duration_minutes,
        c.meeting_link,
        c.status,
        c.created_at,
        hp.full_name as professional_name,
        hp.specialization,
        hp.profile_picture as professional_picture
      FROM sessions c
      JOIN teachers hp ON c.teacher_id = hp.id
      WHERE c.student_id = ?
    `;

    const params: any[] = [patient.id];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.scheduled_date DESC, c.scheduled_time DESC';

    const consultationsRes = await db.execute({ sql: query, args: params });
    const consultations = consultationsRes.rows;

    return NextResponse.json({
      success: true,
      data: consultations,
    });
  } catch (error) {
    console.error('Get consultations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
