import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/teacher/dashboard - Get teacher dashboard data
export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser || currentUser.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    // Get professional ID and details
    const professional = db.prepare(`
      SELECT 
        t.id,
        t.full_name,
        t.specialization,
        t.years_of_experience,
        t.average_rating,
        t.total_reviews
      FROM teachers t
      WHERE t.user_id = ?
    `).get(currentUser.userId) as any;

    if (!professional) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    // Get consultation stats
    const consultationStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'scheduled' OR status = 'confirmed' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN date(scheduled_date) = date('now') AND status IN ('scheduled', 'confirmed') THEN 1 ELSE 0 END) as todays_sessions
      FROM sessions
      WHERE teacher_id = ?
    `).get(currentUser.userId) as {
      total: number;
      scheduled: number;
      completed: number;
      cancelled: number;
      todays_sessions: number;
    };

    // Get active students (unique students who have had sessions)
    const activePatients = db.prepare(`
      SELECT DISTINCT
        p.id,
        p.full_name,
        p.username,
        p.profile_picture,
        (SELECT COUNT(*) FROM sessions c2 WHERE c2.student_id = p.user_id AND c2.teacher_id = ?) as total_sessions,
        (SELECT MAX(c3.scheduled_date) FROM sessions c3 WHERE c3.student_id = p.user_id AND c3.teacher_id = ? AND c3.status = 'completed') as last_session_date,
        (SELECT MIN(c4.scheduled_date) FROM sessions c4 WHERE c4.student_id = p.user_id AND c4.teacher_id = ? AND c4.status IN ('scheduled', 'confirmed') AND date(c4.scheduled_date) >= date('now')) as next_session_date
      FROM sessions c
      JOIN students p ON c.student_id = p.user_id
      WHERE c.teacher_id = ?
      GROUP BY p.id
      ORDER BY last_session_date DESC
      LIMIT 10
    `).all(currentUser.userId, currentUser.userId, currentUser.userId, currentUser.userId);

    // Get today's sessions
    const todayConsultations = db.prepare(`
      SELECT 
        c.id,
        c.scheduled_date,
        c.scheduled_time,
        c.duration_minutes,
        c.meeting_link,
        c.status,
        c.notes,
        p.full_name as student_name,
        p.username as student_username,
        p.profile_picture as student_picture
      FROM sessions c
      JOIN students p ON c.student_id = p.user_id
      WHERE c.teacher_id = ?
        AND date(c.scheduled_date) = date('now')
        AND c.status IN ('scheduled', 'confirmed')
      ORDER BY c.scheduled_time ASC
    `).all(currentUser.userId);

    // Get upcoming sessions (next 7 days, excluding today)
    const upcomingConsultations = db.prepare(`
      SELECT 
        c.id,
        c.scheduled_date,
        c.scheduled_time,
        c.duration_minutes,
        c.meeting_link,
        c.status,
        c.notes,
        p.full_name as student_name,
        p.username as student_username,
        p.profile_picture as student_picture
      FROM sessions c
      JOIN students p ON c.student_id = p.user_id
      WHERE c.teacher_id = ?
        AND c.status IN ('scheduled', 'confirmed')
        AND date(c.scheduled_date) > date('now')
        AND date(c.scheduled_date) <= date('now', '+7 days')
      ORDER BY c.scheduled_date ASC, c.scheduled_time ASC
      LIMIT 10
    `).all(currentUser.userId);

    return NextResponse.json({
      success: true,
      data: {
        professional: {
          id: professional.id,
          name: professional.full_name,
          specialization: professional.specialization,
          experience: professional.years_of_experience,
          rating: professional.average_rating,
          total_reviews: professional.total_reviews,
        },
        stats: {
          totalConsultations: consultationStats.total || 0,
          scheduledConsultations: consultationStats.scheduled || 0,
          completedConsultations: consultationStats.completed || 0,
          cancelledConsultations: consultationStats.cancelled || 0,
          activePatients: activePatients.length,
          todaysSessions: consultationStats.todays_sessions || 0,
        },
        todayConsultations,
        upcomingConsultations,
        activePatients,
      },
    });

  } catch (error) {
    console.error('Get teacher dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
