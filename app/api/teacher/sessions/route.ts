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
      JOIN students st ON s.student_id = st.user_id
      WHERE s.teacher_id = ?
    `;

    const params: any[] = [currentUser.userId];

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

    // Verify session belongs to teacher
    const session = db.prepare(`
      SELECT id FROM sessions WHERE id = ? AND teacher_id = ?
    `).get(sessionId, currentUser.userId);

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
