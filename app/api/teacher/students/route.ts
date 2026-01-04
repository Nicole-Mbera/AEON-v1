import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/teacher/students - Get students associated with the teacher
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

    // Get unique students who have booked this teacher
    const studentsRes = await db.execute({
      sql: `SELECT DISTINCT
        p.user_id,
        p.username,
        p.full_name,
        p.grade_level,
        p.profile_picture,
        p.english_proficiency,
        p.proficiency_certificate,
        u.email,
        (SELECT COUNT(*) FROM sessions WHERE student_id = p.id AND teacher_id = ?) as total_sessions,
        (SELECT MAX(scheduled_date) FROM sessions WHERE student_id = p.id AND teacher_id = ? AND scheduled_date <= DATE('now')) as last_session,
        (SELECT MIN(scheduled_date) FROM sessions WHERE student_id = p.id AND teacher_id = ? AND scheduled_date > DATE('now')) as next_session
      FROM students p
      JOIN users u ON p.user_id = u.id
      JOIN sessions s ON p.id = s.student_id
      WHERE s.teacher_id = ?`,
      args: [teacher.id, teacher.id, teacher.id, teacher.id]
    });

    return NextResponse.json({
      success: true,
      data: studentsRes.rows,
    });
  } catch (error) {
    console.error('Get teacher students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
