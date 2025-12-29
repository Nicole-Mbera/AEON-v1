import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// Get teachers with optional status filter
export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all'; // pending, approved, all

    let query = `
      SELECT 
        hp.id,
        hp.user_id,
        hp.full_name,
        hp.specialization,
        hp.years_of_experience,
        hp.bio,
        hp.phone,
        hp.license_number,
        hp.institution_name,
        hp.country,
        hp.contact_email,
        hp.mission,
        hp.documents,
        u.email,
        u.is_verified,
        u.is_active
      FROM teachers hp
      JOIN users u ON hp.user_id = u.id
      WHERE u.role = 'teacher'
    `;

    if (status === 'pending') {
      query += ' AND u.is_verified = 0';
    } else if (status === 'approved') {
      query += ' AND u.is_verified = 1';
    }

    query += ' ORDER BY hp.id DESC';

    const teachersRes = await db.execute({ sql: query, args: [] });

    return NextResponse.json({
      success: true,
      data: teachersRes.rows,
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
