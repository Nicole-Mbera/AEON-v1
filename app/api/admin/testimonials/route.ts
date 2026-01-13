import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/admin/testimonials - Get all testimonials (pending or all)
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
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', or all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.id,
        t.content,
        t.rating,
        t.is_featured,
        t.approval_status,
        t.created_at,
        t.user_type,
        t.user_id,
        u.email as user_email,
        CASE 
          WHEN t.user_type = 'student' THEN s.full_name
          WHEN t.user_type = 'teacher' THEN hp.full_name
        END as user_name,
        CASE 
          WHEN t.user_type = 'student' THEN s.full_name
          WHEN t.user_type = 'teacher' THEN hp.specialization
          ELSE NULL
        END as additional_info
      FROM testimonials t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN students s ON t.user_type = 'student' AND u.id = s.user_id
      LEFT JOIN teachers hp ON t.user_type = 'teacher' AND u.id = hp.user_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status === 'pending') {
      query += " AND t.approval_status = 'pending'";
    } else if (status === 'approved') {
      query += " AND t.approval_status = 'approved'";
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const testimonialsRes = await db.execute({ sql: query, args: params });
    const testimonials = testimonialsRes.rows;

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM testimonials WHERE 1=1';
    const countParams: any[] = [];

    if (status === 'pending') {
      countQuery += " AND approval_status = 'pending'";
    } else if (status === 'approved') {
      countQuery += " AND approval_status = 'approved'";
    }

    const countRes = await db.execute({ sql: countQuery, args: countParams });
    const totalCount = (countRes.rows[0] as any).count;

    return NextResponse.json({
      success: true,
      data: testimonials,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('Get admin testimonials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
