import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// Get user analytics and growth data
export async function GET(request: Request) {
  try {
    // Authenticate user
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    // Get user counts by role
    const [studentsCountRes, teachersCountRes, adminsCountRes] = await Promise.all([
      db.execute({ sql: "SELECT COUNT(*) as count FROM users WHERE role = 'student'", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM users WHERE role = 'teacher'", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM users WHERE role = 'admin'", args: [] })
    ]);

    const userCounts = {
      students: (studentsCountRes.rows[0] as any).count,
      teachers: (teachersCountRes.rows[0] as any).count,
      admins: (adminsCountRes.rows[0] as any).count,
    };

    // Get user growth over time
    const growthDataRes = await db.execute({
      sql: `SELECT 
        DATE(created_at) as date,
        role,
        COUNT(*) as count
      FROM users
      WHERE created_at >= date('now', '-' || ? || ' days')
      GROUP BY DATE(created_at), role
      ORDER BY date DESC`,
      args: [period]
    });
    const growthData = growthDataRes.rows;

    // Get recent registrations
    const recentUsersRes = await db.execute({
      sql: `SELECT 
        u.id,
        u.email,
        u.role,
        u.created_at,
        u.is_verified,
        u.is_active,
        COALESCE(s.username, t.full_name, a.full_name, u.email) as display_name
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN admins a ON u.id = a.user_id
      ORDER BY u.created_at DESC
      LIMIT 20`,
      args: []
    });
    const recentUsers = recentUsersRes.rows;

    // Get active users (logged in last 7 days)
    const activeUsersRes = await db.execute({
      sql: `SELECT COUNT(DISTINCT user_id) as count
      FROM user_activity
      WHERE created_at >= date('now', '-7 days')`,
      args: []
    });
    const activeUsers = (activeUsersRes.rows[0] as any).count;

    // Get session statistics
    const [totalSessionsRes, scheduledSessionsRes, completedSessionsRes, cancelledSessionsRes] = await Promise.all([
      db.execute({ sql: "SELECT COUNT(*) as count FROM sessions", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM sessions WHERE status = 'scheduled'", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM sessions WHERE status = 'completed'", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM sessions WHERE status = 'cancelled'", args: [] })
    ]);

    const sessionStats = {
      total: (totalSessionsRes.rows[0] as any).count,
      scheduled: (scheduledSessionsRes.rows[0] as any).count,
      completed: (completedSessionsRes.rows[0] as any).count,
      cancelled: (cancelledSessionsRes.rows[0] as any).count,
    };

    // Get pending teacher approvals count
    const pendingTeachersRes = await db.execute({
      sql: `SELECT COUNT(*) as count 
      FROM users 
      WHERE role = 'teacher' AND is_verified = 0 AND is_active = 1`,
      args: []
    });
    const pendingTeachers = (pendingTeachersRes.rows[0] as any).count;

    return NextResponse.json({
      success: true,
      data: {
        userCounts,
        growthData,
        recentUsers,
        activeUsers,
        sessionStats,
        pendingTeachers,
      },
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
