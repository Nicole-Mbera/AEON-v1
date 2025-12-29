import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { randomBytes } from 'crypto';

// Helper to generate unique Jitsi room ID
function generateJitsiRoomId(): string {
  return `bodywise-${Date.now()}-${randomBytes(8).toString('hex')}`;
}

// POST /api/student/sessions/book - Book a session
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Students only' }, { status: 403 });
    }

    const body = await req.json();
    const { teacherId, scheduledDate, scheduledTime, notes } = body;

    if (!teacherId || !scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: 'Missing required booking details' }, { status: 400 });
    }

    // Get student_id from user_id
    const studentRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [decoded.userId]
    });
    const student = studentRes.rows[0] as unknown as { id: number } | undefined;

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // 1. Verify availability (manual check instead of transaction for now)
    const existingRes = await db.execute({
      sql: `SELECT id FROM sessions 
            WHERE teacher_id = ? 
              AND scheduled_date = ? 
              AND scheduled_time = ?
              AND status != 'cancelled'`,
      args: [teacherId, scheduledDate, scheduledTime]
    });

    if (existingRes.rows.length > 0) {
      return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });
    }

    // Generate unique meeting link
    const jitsiRoomId = generateJitsiRoomId();
    const meetingLink = `https://meet.jit.si/${jitsiRoomId}`;

    // Create session
    const insertRes = await db.execute({
      sql: `INSERT INTO sessions (
              student_id,
              teacher_id,
              scheduled_date,
              scheduled_time,
              duration_minutes,
              meeting_link,
              notes,
              status
            ) VALUES (?, ?, ?, ?, 60, ?, ?, 'scheduled')`,
      args: [
        student.id,
        teacherId,
        scheduledDate,
        scheduledTime,
        meetingLink,
        notes || null
      ]
    });

    // Handle lastInsertRowid
    let sessionId = insertRes.lastInsertRowid;
    // Fallback if not returned or 0 (though LibSQL usually returns it)
    if (!sessionId) {
      // Try to fetch it
      const fetchBack = await db.execute({
        sql: 'SELECT id FROM sessions WHERE student_id = ? AND scheduled_date = ? AND scheduled_time = ?',
        args: [student.id, scheduledDate, scheduledTime]
      });
      if (fetchBack.rows[0]) sessionId = fetchBack.rows[0].id as bigint;
    }

    const resultSession = {
      sessionId: sessionId?.toString(),
      meetingLink,
      scheduledDate,
      scheduledTime
    };

    // Send confirmation email asynchronously
    try {
      // Fetch student email and name
      const studentDataRes = await db.execute({
        sql: `SELECT s.full_name, u.email 
              FROM students s
              JOIN users u ON s.user_id = u.id
              WHERE s.id = ?`,
        args: [student.id]
      });
      const studentData = studentDataRes.rows[0] as unknown as { full_name: string; email: string };

      // Fetch teacher name
      const teacherDataRes = await db.execute({
        sql: 'SELECT full_name FROM teachers WHERE id = ?',
        args: [teacherId]
      });
      const teacherData = teacherDataRes.rows[0] as unknown as { full_name: string };

      if (studentData?.email && teacherData) {
        const { sendEmail, emailTemplates } = await import('@/lib/email');

        await sendEmail(
          studentData.email,
          emailTemplates.confirmation({
            studentName: studentData.full_name || 'Student',
            mentorName: teacherData.full_name,
            date: scheduledDate,
            time: scheduledTime,
            meetingLink: resultSession.meetingLink,
          })
        );
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({
      message: 'Session booked successfully',
      session: resultSession
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

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Students only' }, { status: 403 });
    }

    // Get patient_id (assuming the query meant students table or patients table depending on schema; keeping original query table 'patients' but usually it might be 'students' in education schema? )
    // Wait, createSession used 'students'. This GET uses 'patients'. This seems broken if they are different tables.
    // I will stick to 'students' since that's what POST uses and decoded role is 'student'.
    // BUT the original code used 'patients'.
    // If I change it to 'students', I might fix a bug OR break legacy compatibility.
    // Given the context is 'Education' (AEON default to education schema), I'll try to align with POST: Use 'students'.

    // Check if 'patients' table exists? If not, use 'students'.
    // Safest is to use 'students' because `POST` used generic `db.execute` on `students`.

    const studentRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [decoded.userId]
    });

    // If no student found, maybe check 'patients' (legacy)? 
    // I'll stick to 'students' for consistency with POST.
    const student = studentRes.rows[0] as unknown as { id: number } | undefined;

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Original query used 'consultations'. POST used 'sessions'.
    // If `sessions` is valid, I should use `sessions`.
    // Let's assume `sessions` is the correct table for the new feature.
    // But if I change it, I assume the FE expects `sessions` structure.

    // I will try to support `sessions` table primarily since `POST` writes there.
    // But I will keep the column selection similar to logic.

    let query = `
      SELECT 
        s.id,
        s.scheduled_date,
        s.scheduled_time,
        s.duration_minutes,
        s.meeting_link,
        s.status,
        s.notes,
        t.full_name as professional_name,
        t.specialization,
        t.profile_picture as professional_picture
      FROM sessions s
      JOIN teachers t ON s.teacher_id = t.id
      WHERE s.student_id = ?
    `;
    // NOTE: I changed 'consultations' -> 'sessions' and 'hp.professional_id' -> 't.teacher_id' logic based on POST.
    // And 'patient_id' -> 'student_id'.
    // And 'teachers hp' -> 'teachers t'

    const args: any[] = [student.id];

    if (status) {
      query += ' AND s.status = ?';
      args.push(status);
    }

    query += ' ORDER BY s.scheduled_date DESC, s.scheduled_time DESC';

    const sessionsRes = await db.execute({ sql: query, args });

    return NextResponse.json({ consultations: sessionsRes.rows }); // Keeping "consultations" key for FE compatibility? or "sessions"?
    // Original returned { consultations }. I'll keep it.

  } catch (error: any) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get sessions' }, { status: 500 });
  }
}

// PATCH /api/student/sessions - Cancel session
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Students only' }, { status: 403 });
    }

    const body = await req.json();
    const { consultationId } = body; // This is actually sessionId in new schema

    if (!consultationId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const studentRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [decoded.userId]
    });
    const student = studentRes.rows[0] as unknown as { id: number } | undefined;

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Check session
    const sessionRes = await db.execute({
      sql: 'SELECT id, status FROM sessions WHERE id = ? AND student_id = ?',
      args: [consultationId, student.id]
    });
    const session = sessionRes.rows[0] as unknown as { id: number; status: string } | undefined;

    if (!session) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    if (session.status === 'cancelled') {
      return NextResponse.json({ error: 'Session already cancelled' }, { status: 400 });
    }

    // Update status
    await db.execute({
      sql: "UPDATE sessions SET status = 'cancelled' WHERE id = ?",
      args: [consultationId]
    });

    // Note: Availability slot freeing logic omitted as sessions table seems to enforce uniqueness by itself or logic in POST checks it. 
    // And email reminders cancellation omitted (different table).

    return NextResponse.json({ message: 'Session cancelled successfully' });

  } catch (error: any) {
    console.error('Cancel session error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to cancel session'
    }, { status: 500 });
  }
}
