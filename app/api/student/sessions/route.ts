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
    
    if (!currentUser || !hasRole(currentUser, 'patient')) {
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
    const patientQuery = db.prepare('SELECT id FROM patients WHERE user_id = ?');
    const patient = patientQuery.get(currentUser.userId) as any;
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }
    
    // Check if professional exists and is active
    const professionalCheck = db.prepare(`
      SELECT hp.id 
      FROM teachers hp
      JOIN users u ON hp.user_id = u.id
      WHERE hp.id = ? AND u.is_active = 1
    `);
    
    if (!professionalCheck.get(teacher_id)) {
      return NextResponse.json(
        { error: 'Professional not found or inactive' },
        { status: 404 }
      );
    }
    
    // Check if patient already has 2 bookings for this day (limit per day)
    const patientBookingsToday = db.prepare(`
      SELECT COUNT(*) as count FROM sessions
      WHERE student_id = ?
        AND scheduled_date = ?
        AND status IN ('scheduled', 'confirmed')
    `).get(patient.id, scheduled_date) as { count: number };

    if (patientBookingsToday.count >= 2) {
      return NextResponse.json(
        { error: 'You can only book up to 2 consultations per day' },
        { status: 409 }
      );
    }

    // Check for conflicting appointments
    const conflictCheck = db.prepare(`
      SELECT id FROM sessions
      WHERE teacher_id = ? 
        AND scheduled_date = ? 
        AND scheduled_time = ?
        AND status IN ('scheduled', 'confirmed')
    `);
    
    if (conflictCheck.get(teacher_id, scheduled_date, scheduled_time)) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      );
    }
    
    // Create consultation with start_time
    const startTime = new Date(`${scheduled_date}T${scheduled_time}`);
    const insertQuery = db.prepare(`
      INSERT INTO consultations (student_id, teacher_id, scheduled_date, scheduled_time, start_time, duration_minutes, status, meeting_link)
      VALUES (?, ?, ?, ?, ?, 30, 'scheduled', ?)
    `);
    
    const meetingLink = `https://meet.jit.si/bodywise-${Date.now()}`; // Jitsi room
    const result = insertQuery.run(
      patient.id, 
      teacher_id, 
      scheduled_date, 
      scheduled_time, 
      startTime.toISOString(),
      meetingLink
    );
    
    // Send confirmation email asynchronously
    const consultationId = Number(result.lastInsertRowid);
    sendConfirmationEmail(consultationId).catch((error: unknown) => {
      console.error('Failed to send confirmation email:', error);
      // Don't fail the booking if email fails
    });
    
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
    
    if (!currentUser || !hasRole(currentUser, 'patient')) {
      return NextResponse.json(
        { error: 'Unauthorized. Patient access required.' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Get patient ID
    const patientQuery = db.prepare('SELECT id FROM patients WHERE user_id = ?');
    const patient = patientQuery.get(currentUser.userId) as any;
    
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
        hp.profile_picture as professional_picture,
        i.name as institution_name
      FROM sessions c
      JOIN teachers hp ON c.teacher_id = hp.id
      LEFT JOIN 
      WHERE c.student_id = ?
    `;
    
    const params: any[] = [patient.id];
    
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY c.scheduled_date DESC, c.scheduled_time DESC';
    
    const consultations = db.prepare(query).all(...params);
    
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
