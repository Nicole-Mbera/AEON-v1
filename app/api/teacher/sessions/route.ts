import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/teacher/sessions - Get sessions for the teacher
export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'teacher')) {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    const teacherRes = await db.execute({
      sql: 'SELECT id FROM teachers WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const teacher = teacherRes.rows[0] as unknown as { id: number } | undefined;

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = `
      SELECT 
        s.id,
        s.scheduled_date,
        s.scheduled_time,
        s.duration_minutes,
        s.status,
        s.meeting_link,
        s.notes,
        stu.full_name as student_name,
        u.email as student_email
      FROM sessions s
      JOIN students stu ON s.student_id = stu.id
      JOIN users u ON stu.user_id = u.id
      WHERE s.teacher_id = ?
    `;

    const params: any[] = [teacher.id];

    if (date) {
      query += ' AND s.scheduled_date = ?';
      params.push(date);
    }

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.scheduled_date ASC, s.scheduled_time ASC';

    const sessionsRes = await db.execute({
      sql: query,
      args: params
    });

    return NextResponse.json({
      success: true,
      data: sessionsRes.rows,
    });
  } catch (error) {
    console.error('Get teacher sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/teacher/sessions - Update session details (e.g. status, meeting link)
export async function PATCH(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'teacher')) {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sessionId, status, meetingLink, notes } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const teacherRes = await db.execute({
      sql: 'SELECT id FROM teachers WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const teacher = teacherRes.rows[0] as unknown as { id: number } | undefined;

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Verify session belongs to teacher
    const sessionRes = await db.execute({
      sql: `SELECT id FROM sessions WHERE id = ? AND teacher_id = ?`,
      args: [sessionId, teacher.id]
    });
    const session = sessionRes.rows[0];

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (meetingLink !== undefined) {
      updates.push('meeting_link = ?');
      params.push(meetingLink);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    params.push(sessionId);

    await db.execute({
      sql: `UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`,
      args: params
    });

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully'
    });

  } catch (error) {
    console.error('Update teacher session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
