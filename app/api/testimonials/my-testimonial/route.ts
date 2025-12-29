
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const testimonialRes = await db.execute({
      sql: `SELECT * FROM testimonials WHERE user_id = ?`,
      args: [currentUser.userId]
    });
    const testimonial = testimonialRes.rows[0];

    return NextResponse.json({
      success: true,
      data: testimonial || null,
    });

  } catch (error) {
    console.error('Get my testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, rating } = await request.json();

    if (!content || !rating) {
      return NextResponse.json(
        { error: 'Content and rating are required' },
        { status: 400 }
      );
    }

    // Update existing
    // Check if exists first
    const existingRes = await db.execute({
      sql: 'SELECT * FROM testimonials WHERE user_id = ?',
      args: [currentUser.userId]
    });

    if (existingRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // When updating, we might want to reset approval status to pending?
    // For now, let's keep it simple and just update content.
    // If strict moderation is needed, set is_approved = 0
    await db.execute({
      sql: `UPDATE testimonials 
        SET content = ?, rating = ?, is_approved = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = ?`,
      args: [content, rating, currentUser.userId]
    });

    return NextResponse.json({
      success: true,
      message: 'Testimonial updated successfully. Pending re-approval.',
    });

  } catch (error) {
    console.error('Update my testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await db.execute({
      sql: 'DELETE FROM testimonials WHERE user_id = ?',
      args: [currentUser.userId]
    });

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });

  } catch (error) {
    console.error('Delete my testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
