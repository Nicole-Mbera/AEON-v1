import { NextResponse } from 'next/server';
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
    const userCounts = {
      students: (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get() as any).count,
      teachers: (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'").get() as any).count,
      admins: (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as any).count,
    };
    
    // Get user growth over time
    const growthQuery = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        role,
        COUNT(*) as count
      FROM users
      WHERE created_at >= date('now', '-' || ? || ' days')
      GROUP BY DATE(created_at), role
      ORDER BY date DESC
    `);
    
    const growthData = growthQuery.all(period);
    
    // Get recent registrations
    const recentUsersQuery = db.prepare(`
      SELECT 
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
      LIMIT 20
    `);
    
    const recentUsers = recentUsersQuery.all();
    
    // Get active users (logged in last 7 days)
    const activeUsersQuery = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM user_activity
      WHERE created_at >= date('now', '-7 days')
    `);
    
    const activeUsers = (activeUsersQuery.get() as any).count;
    
    // Get session statistics
    const sessionStats = {
      total: (db.prepare("SELECT COUNT(*) as count FROM sessions").get() as any).count,
      scheduled: (db.prepare("SELECT COUNT(*) as count FROM sessions WHERE status = 'scheduled'").get() as any).count,
      completed: (db.prepare("SELECT COUNT(*) as count FROM sessions WHERE status = 'completed'").get() as any).count,
      cancelled: (db.prepare("SELECT COUNT(*) as count FROM sessions WHERE status = 'cancelled'").get() as any).count,
    };
    
    // Get pending teacher approvals count
    const pendingTeachers = (db.prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role = 'teacher' AND is_verified = 0 AND is_active = 1
    `).get() as any).count;
    
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
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
