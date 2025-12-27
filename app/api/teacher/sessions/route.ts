import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/teacher/sessions
export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get teacher profile
    const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(currentUser.userId) as { id: number } | undefined;

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';

    let query = `
      SELECT 
        s.id,
        s.scheduled_date,
        s.scheduled_time,
        s.duration_minutes,
        s.meeting_link,
        s.status,
        s.notes,
        st.user_id as student_user_id,
        st.full_name as student_name,
        st.username as student_username,
        st.profile_picture as student_picture
      FROM sessions s
      JOIN students st ON s.student_id = st.id
      WHERE s.teacher_id = ?
    `;

    const params: any[] = [teacher.id];

    if (status !== 'all') {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY s.scheduled_date DESC, s.scheduled_time DESC`;

    const sessions = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Get teacher sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/teacher/sessions - Update session status
export async function PATCH(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId, status, notes } = body;

    if (!sessionId || !status) {
      return NextResponse.json(
        { error: 'Session ID and status are required' },
        { status: 400 }
      );
    }

    // Get teacher profile
    const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(currentUser.userId) as { id: number } | undefined;

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    // Verify session belongs to teacher and get student details for email
    const session = db.prepare(`
      SELECT 
        s.id, 
        s.scheduled_date, 
        s.scheduled_time,
        st.full_name as student_name,
        u.email as student_email,
        t.full_name as teacher_name
      FROM sessions s
      JOIN students st ON s.student_id = st.id
      JOIN users u ON st.user_id = u.id
      JOIN teachers t ON s.teacher_id = t.id
      WHERE s.id = ? AND s.teacher_id = ?
    `).get(sessionId, teacher.id) as any;

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update session
    const updateStmt = db.prepare(`
      UPDATE sessions
      SET status = ?, notes = COALESCE(?, notes)
      WHERE id = ?
    `);

    updateStmt.run(status, notes || null, sessionId);

    // Send email notification if cancelled
    if (status === 'cancelled') {
      try {
        const { sendEmail } = await import('@/lib/email'); // Dynamic import to avoid circular deps if any
        const emailSubject = `Session Cancelled - ${session.teacher_name}`;
        const emailHtml = `
          <h2>Session Cancelled</h2>
          <p>Hello ${session.student_name},</p>
          <p>Your session with ${session.teacher_name} has been cancelled by the teacher.</p>
          <p><strong>Original Date:</strong> ${new Date(session.scheduled_date).toLocaleDateString()}</p>
          <p><strong>Original Time:</strong> ${session.scheduled_time}</p>
          <p>Please log in to your dashboard to book a new session or contact support if you have questions.</p>
        `;

        await sendEmail(session.student_email, {
          subject: emailSubject,
          html: emailHtml
        });
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully',
    });
  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
