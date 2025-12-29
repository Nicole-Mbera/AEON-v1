import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/student/dashboard - Get student dashboard data
export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'student')) {
      return NextResponse.json(
        { error: 'Unauthorized. student access required.' },
        { status: 403 }
      );
    }

    // Get student ID
    const studentRes = await db.execute({
      sql: 'SELECT id, username, full_name, english_proficiency FROM students WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const student = studentRes.rows[0] as unknown as { id: number; username: string; full_name: string; english_proficiency: string | null } | undefined;

    if (!student) {
      return NextResponse.json(
        { error: 'student profile not found' },
        { status: 404 }
      );
    }

    // Get upcoming appointments (next 7 days)
    const upcomingAppointmentsRes = await db.execute({
      sql: `SELECT 
          c.id,
          c.scheduled_date,
          c.scheduled_time,
          c.duration_minutes,
          c.meeting_link,
          c.status,
          c.notes,
          hp.full_name AS doctor_name,
          hp.specialization,
          hp.profile_picture AS doctor_picture
        FROM sessions c
        JOIN teachers hp ON c.teacher_id = hp.id
        WHERE c.student_id = ?
          AND c.status IN ('scheduled', 'confirmed')
          AND datetime(c.scheduled_date || ' ' || c.scheduled_time) > datetime('now')
          AND date(c.scheduled_date) <= date('now', '+30 days')
        ORDER BY c.scheduled_date ASC, c.scheduled_time ASC
        LIMIT 5`,
      args: [student.id]
    });
    const upcomingAppointments = upcomingAppointmentsRes.rows;

    // Get consultation stats
    const consultationStatsRes = await db.execute({
      sql: `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN (status = 'scheduled' OR status = 'confirmed') AND datetime(scheduled_date || ' ' || scheduled_time) > datetime('now') THEN 1 ELSE 0 END) as scheduled,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
        FROM sessions
        WHERE student_id = ?`,
      args: [student.id]
    });
    const consultationStats = consultationStatsRes.rows[0] as unknown as {
      total: number;
      scheduled: number;
      completed: number;
      cancelled: number;
    };

    // Get recent articles (last 3)
    const recentArticlesRes = await db.execute({
      sql: `SELECT 
          a.id,
          a.title,
          a.content,
          a.author_type AS category,
          a.thumbnail_url,
          a.views_count,
          a.created_at,
          CASE 
            WHEN a.author_type = 'teacher' THEN hp.full_name
            WHEN a.author_type = 'admin' THEN ia.full_name
          END as author_name,
          CASE 
            WHEN a.author_type = 'teacher' THEN hp.specialization
            ELSE NULL
          END as author_specialization
        FROM articles a
        LEFT JOIN teachers hp ON a.author_type = 'teacher' AND a.author_id = hp.id
        LEFT JOIN admins ia ON a.author_type = 'admin' AND a.author_id = ia.id
        WHERE a.is_published = 1
        ORDER BY a.created_at DESC
        LIMIT 3`,
      args: []
    });
    const recentArticles = recentArticlesRes.rows;

    // Get pending invitations - returning empty array as feature is not supported in current schema
    const pendingInvitations: any[] = [];

    return NextResponse.json({
      success: true,
      data: {
        student: {
          name: student.full_name || student.username,
          username: student.username,
          english_proficiency: student.english_proficiency,
        },
        stats: {
          totalConsultations: consultationStats?.total || 0,
          scheduledConsultations: consultationStats?.scheduled || 0,
          completedConsultations: consultationStats?.completed || 0,
          cancelledConsultations: consultationStats?.cancelled || 0,
        },
        upcomingAppointments,
        recentArticles,
        pendingInvitations,
      },
    });

  } catch (error) {
    console.error('Get student dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
