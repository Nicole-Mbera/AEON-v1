
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const testimonialId = params.id;
    const body = await request.json();
    const { approval_status, is_featured } = body;

    // Verify testimonial exists
    const testimonialRes = await db.execute({
      sql: 'SELECT id FROM testimonials WHERE id = ?',
      args: [testimonialId]
    });
    const testimonial = testimonialRes.rows[0];

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Build update query
    let updateQuery = 'UPDATE testimonials SET ';
    const updateParams = [];
    const updates = [];

    if (approval_status !== undefined) {
      updates.push('approval_status = ?');
      updateParams.push(approval_status);
    }

    if (is_featured !== undefined) {
      updates.push('is_featured = ?');
      updateParams.push(is_featured ? 1 : 0);
    }

    if (updates.length > 0) {
      updateQuery += updates.join(', ') + ' WHERE id = ?';
      updateParams.push(testimonialId);

      await db.execute({
        sql: updateQuery,
        args: updateParams
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial updated successfully'
    });

  } catch (error) {
    console.error('Update testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const testimonialId = params.id;

    await db.execute({
      sql: 'DELETE FROM testimonials WHERE id = ?',
      args: [testimonialId]
    });

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });

  } catch (error) {
    console.error('Delete testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
