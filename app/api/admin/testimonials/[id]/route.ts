import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// PUT /api/admin/testimonials/[id] - Approve or reject testimonial
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const testimonialId = parseInt(id);
    const { action, is_featured, rejection_reason } = await request.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get testimonial
    const testimonial = db.prepare(`
      SELECT t.*, u.email FROM testimonials t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(testimonialId);

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Approve testimonial
      db.prepare(`
        UPDATE testimonials 
        SET is_approved = 1,
            is_featured = ?
        WHERE id = ?
      `).run(is_featured ? 1 : 0, testimonialId);

      return NextResponse.json({
        success: true,
        message: 'Testimonial approved successfully',
      });

    } else {
      // Reject testimonial
      db.prepare(`
        UPDATE testimonials 
        SET is_approved = 0,
            is_featured = 0
        WHERE id = ?
      `).run(testimonialId);

      return NextResponse.json({
        success: true,
        message: 'Testimonial rejected',
      });
    }

  } catch (error) {
    console.error('Testimonial approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
