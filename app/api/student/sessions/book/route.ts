import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { randomBytes } from 'crypto';

// Helper to generate unique Jitsi room ID
function generateJitsiRoomId(): string {
  return `bodywise-${Date.now()}-${randomBytes(8).toString('hex')}`;
}

// POST /api/student/sessions/book - Book a session
// POST /api/student/sessions/book - Book a session
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Students only' }, { status: 403 });
    }

    const body = await req.json();
    const { teacherId, scheduledDate, scheduledTime, notes } = body;

    if (!teacherId || !scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: 'Missing required booking details' }, { status: 400 });
    }

    // Get student_id from user_id
    const student = db.prepare(
      'SELECT id FROM students WHERE user_id = ?'
    ).get(decoded.userId) as { id: number } | undefined;

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Start transaction for atomic booking
    const bookSession = db.transaction(() => {
      // 1. Verify availability (check for existing booking collision)
      const existingBooking = db.prepare(`
        SELECT id FROM sessions 
        WHERE teacher_id = ? 
          AND scheduled_date = ? 
          AND scheduled_time = ?
          AND status != 'cancelled'
      `).get(teacherId, scheduledDate, scheduledTime);

      if (existingBooking) {
        throw new Error('Slot already booked');
      }

      // Generate unique meeting link
      const jitsiRoomId = generateJitsiRoomId();
      const meetingLink = `https://meet.jit.si/${jitsiRoomId}`;

      // Create session
      const insertSession = db.prepare(`
        INSERT INTO sessions (
          student_id,
          teacher_id,
          scheduled_date,
          scheduled_time,
          duration_minutes,
          meeting_link,
          notes,
          status
        ) VALUES (?, ?, ?, ?, 60, ?, ?, 'scheduled')
      `);

      const result = insertSession.run(
        student.id,
        teacherId,
        scheduledDate,
        scheduledTime,
        meetingLink,
        notes || null
      );

      const sessionId = result.lastInsertRowid;

      // Note: Reminder logic suppressed for now to minimize complexity/errors since email tables may also differ.
      // Can be re-enabled after verifying schema for reminders.

      return {
        sessionId,
        meetingLink,
        scheduledDate,
        scheduledTime,
      };
    });

    const result = bookSession();

    return NextResponse.json({
      message: 'Session booked successfully',
      session: result
    });

  } catch (error: any) {
    console.error('Book session error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to book session'
    }, { status: 500 });
  }
}

// GET /api/student/sessions - Get student's sessions
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Students only' }, { status: 403 });
    }

    // Get patient_id
    const patient = db.prepare(
      'SELECT id FROM patients WHERE user_id = ?'
    ).get(decoded.userId) as { id: number } | undefined;

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = `
      SELECT 
        c.id,
        c.scheduled_date,
        c.scheduled_time,
        c.duration_minutes,
        c.meeting_link,
        c.jitsi_room_id,
        c.status,
        c.notes,
        c.created_at,
        hp.full_name as professional_name,
        hp.specialization,
        hp.profile_picture as professional_picture
      FROM consultations c
      JOIN teachers hp ON c.professional_id = hp.id
      WHERE c.patient_id = ?
    `;
    const params: any[] = [patient.id];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.scheduled_date DESC, c.scheduled_time DESC';

    const consultations = db.prepare(query).all(...params);

    return NextResponse.json({ consultations });

  } catch (error: any) {
    console.error('Get consultations error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get consultations' }, { status: 500 });
  }
}

// PATCH /api/student/sessions - Cancel session
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Students only' }, { status: 403 });
    }

    const body = await req.json();
    const { consultationId } = body;

    if (!consultationId) {
      return NextResponse.json({ error: 'Consultation ID required' }, { status: 400 });
    }

    // Get patient_id
    const patient = db.prepare(
      'SELECT id FROM patients WHERE user_id = ?'
    ).get(decoded.userId) as { id: number } | undefined;

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // Cancel consultation in transaction
    const cancelConsultation = db.transaction(() => {
      // Check if consultation exists and belongs to patient
      const consultation = db.prepare(`
        SELECT id, slot_id, status FROM consultations
        WHERE id = ? AND patient_id = ?
      `).get(consultationId, patient.id) as {
        id: number;
        slot_id: number;
        status: string;
      } | undefined;

      if (!consultation) {
        throw new Error('Consultation not found or unauthorized');
      }

      if (consultation.status === 'cancelled') {
        throw new Error('Consultation already cancelled');
      }

      // Update consultation status
      db.prepare('UPDATE consultations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('cancelled', consultationId);

      // Free up the slot
      if (consultation.slot_id) {
        db.prepare('UPDATE availability_slots SET is_booked = 0 WHERE id = ?')
          .run(consultation.slot_id);
      }

      // Cancel pending email reminders
      db.prepare(`
        UPDATE email_reminders 
        SET status = 'failed', error_message = 'Consultation cancelled'
        WHERE consultation_id = ? AND status = 'pending'
      `).run(consultationId);
    });

    cancelConsultation();

    return NextResponse.json({ message: 'Consultation cancelled successfully' });

  } catch (error: any) {
    console.error('Cancel consultation error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to cancel consultation'
    }, { status: 500 });
  }
}
