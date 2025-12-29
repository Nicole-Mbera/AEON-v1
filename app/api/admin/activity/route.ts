import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// Get activity logs
export async function GET(request: Request) {
  try {
    // Authenticate user
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. System Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const activityType = searchParams.get('type');
    const userId = searchParams.get('user_id');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        ua.id,
        ua.activity_type,
        ua.details,
        ua.created_at,
        u.email,
        u.role
      FROM user_activity ua
      JOIN users u ON ua.user_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (activityType) {
      query += ' AND ua.activity_type = ?';
      params.push(activityType);
    }

    if (userId) {
      query += ' AND ua.user_id = ?';
      params.push(parseInt(userId));
    }

    query += ' ORDER BY ua.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const activitiesRes = await db.execute({ sql: query, args: params });
    const activities = activitiesRes.rows;

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM user_activity WHERE 1=1';
    const countParams: any[] = [];

    if (activityType) {
      countQuery += ' AND activity_type = ?';
      countParams.push(activityType);
    }

    if (userId) {
      countQuery += ' AND user_id = ?';
      countParams.push(parseInt(userId));
    }

    const countRes = await db.execute({ sql: countQuery, args: countParams });
    const totalCount = (countRes.rows[0] as any).count;

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
