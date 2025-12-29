import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { userQueries, activityQueries } from '@/lib/db';

// Get all users (System Admin only)
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let users;

    if (role) {
      users = await userQueries.getUsersByRole(role);
    } else {
      users = await userQueries.getAllUsers(limit, offset);
    }

    // Get counts by role
    const [patientCount, teacherCount, adminCount] = await Promise.all([
      userQueries.countUsersByRole('patient'),
      userQueries.countUsersByRole('teacher'),
      userQueries.countUsersByRole('admin')
    ]);

    const counts = {
      patient: (patientCount as any).count,
      teacher: (teacherCount as any).count,
      admin: (adminCount as any).count,
    };

    return NextResponse.json({
      success: true,
      users,
      counts,
      pagination: {
        page,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
