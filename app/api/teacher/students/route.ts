import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/teacher/students - Get all students who have booked sessions with this teacher
export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all unique students who have had sessions with this teacher
    const students = db.prepare(`
      SELECT DISTINCT
        s.user_id,
        s.username,
        s.full_name,
        s.grade_level,
        s.profile_picture,
        COUNT(DISTINCT sess.id) as total_sessions,
        MAX(CASE WHEN sess.status = 'completed' THEN sess.scheduled_date END) as last_session,
        MIN(CASE WHEN sess.status IN ('scheduled', 'confirmed') AND datetime(sess.scheduled_date || ' ' || sess.scheduled_time) > datetime('now') THEN datetime(sess.scheduled_date || ' ' || sess.scheduled_time) END) as next_session
      FROM students s
      JOIN sessions sess ON s.user_id = sess.student_id
      WHERE sess.teacher_id = ?
      GROUP BY s.user_id, s.username, s.full_name, s.grade_level, s.profile_picture
      ORDER BY last_session DESC, s.full_name ASC
    `).all(currentUser.userId);

    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Get teacher students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
