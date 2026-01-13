import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/testimonials - Get approved testimonials for public display
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const featured = searchParams.get('featured') === 'true';

    let query = `
      SELECT 
        t.id,
        t.content,
        t.rating,
        t.created_at,
        t.user_type,
        CASE 
          WHEN t.user_type = 'student' THEN s.full_name
          WHEN t.user_type = 'teacher' THEN hp.full_name
        END as user_name,
        CASE 
          WHEN t.user_type = 'student' THEN 'Student'
          WHEN t.user_type = 'teacher' THEN hp.specialization
          ELSE NULL
        END as user_role_display
      FROM testimonials t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN students s ON t.user_type = 'student' AND u.id = s.user_id
      LEFT JOIN teachers hp ON t.user_type = 'teacher' AND u.id = hp.user_id
      WHERE t.approval_status = 'approved'
    `;

    const params = [];

    if (featured) {
      query += ' AND t.is_featured = 1';
    }

    query += ' ORDER BY t.created_at DESC LIMIT ?';
    params.push(limit);

    const testimonialsRes = await db.execute({
      sql: query,
      args: params
    });

    return NextResponse.json({
      success: true,
      data: testimonialsRes.rows,
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/testimonials - Create a new testimonial
export async function POST(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to leave a testimonial.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, rating } = body;

    if (!content || !rating) {
      return NextResponse.json(
        { error: 'Content and rating are required' },
        { status: 400 }
      );
    }

    // Check if user has already left a testimonial (limit 1 per user for now)
    const existingRes = await db.execute({
      sql: 'SELECT id FROM testimonials WHERE user_id = ?',
      args: [currentUser.userId]
    });

    if (existingRes.rows.length > 0) {
      return NextResponse.json(
        { error: 'You have already submitted a testimonial.' },
        { status: 400 }
      );
    }

    // Get user type (student or teacher)
    // We can infer this from the user's role in the token, but let's double check DB role
    // For now using the role from the token is safe enough for this purpose
    const userRole = currentUser.role === 'admin' ? 'student' : currentUser.role; // Admins shouldn't really leave testimonials but fallback to student

    await db.execute({
      sql: `INSERT INTO testimonials (user_id, user_type, content, rating, approval_status, is_featured)
      VALUES (?, ?, ?, ?, 'pending', 0)`,
      args: [currentUser.userId, userRole, content, rating]
    });

    return NextResponse.json({
      success: true,
      message: 'Testimonial submitted successfully. It will be visible after approval.',
    }, { status: 201 });

  } catch (error) {
    console.error('Create testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
