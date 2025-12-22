import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';
import { sendEmail } from '@/lib/email';

// GET - Get all bookings for teacher
export async function GET(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser || currentUser.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    // Get teacher_id
    const professional = db.prepare(
      'SELECT id, full_name FROM teachers WHERE user_id = ?'
    ).get(currentUser.userId) as { id: number; full_name: string } | undefined;

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = `
      SELECT 
        c.id,
        c.scheduled_date,
        c.scheduled_time,
        c.duration_minutes,
        c.meeting_link,
        c.status,
        c.notes,
        c.created_at,
        p.full_name as student_name,
        p.username as student_username,
        p.profile_picture as student_picture,
        p.phone as student_phone,
        u.email as student_email
      FROM sessions c
      JOIN students p ON c.student_id = p.user_id
      JOIN users u ON p.user_id = u.id
      WHERE c.teacher_id = ?
    `;

    const params: any[] = [professional.id];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (startDate) {
      query += ' AND date(c.scheduled_date) >= date(?)';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date(c.scheduled_date) <= date(?)';
      params.push(endDate);
    }

    query += ' ORDER BY c.scheduled_date DESC, c.scheduled_time DESC';

    const bookings = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update booking status (confirm, cancel, complete)
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser || currentUser.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    const { bookingId, status, notes } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get teacher_id
    const professional = db.prepare(
      'SELECT id, full_name FROM teachers WHERE user_id = ?'
    ).get(currentUser.userId) as { id: number; full_name: string } | undefined;

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Get booking details
    const booking = db.prepare(`
      SELECT 
        c.*,
        p.full_name as student_name,
        u.email as student_email
      FROM sessions c
      JOIN students p ON c.student_id = p.user_id
      JOIN users u ON p.user_id = u.id
      WHERE c.id = ? AND c.teacher_id = ?
    `).get(bookingId, professional.id) as any;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking
    let updateQuery = 'UPDATE sessions SET status = ?';
    const updateParams: any[] = [status];

    if (notes !== undefined) {
      updateQuery += ', notes = ?';
      updateParams.push(notes);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(bookingId);

    db.prepare(updateQuery).run(...updateParams);

    // Send email notification to student
    try {
      const emailSubject = `Session ${status === 'confirmed' ? 'Confirmed' : status === 'cancelled' ? 'Cancelled' : 'Updated'} - ${professional.full_name}`;
      const emailHtml = `
        <h2>Session ${status === 'confirmed' ? 'Confirmed' : status === 'cancelled' ? 'Cancelled' : 'Updated'}</h2>
        <p>Hello ${booking.student_name},</p>
        <p>Your session with ${professional.full_name} has been <strong>${status}</strong>.</p>
        <p><strong>Date:</strong> ${new Date(booking.scheduled_date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.scheduled_time}</p>
        <p><strong>Duration:</strong> ${booking.duration_minutes} minutes</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        ${booking.meeting_link && status !== 'cancelled' ? `<p><strong>Meeting Link:</strong> <a href="${booking.meeting_link}">${booking.meeting_link}</a></p>` : ''}
        ${status === 'confirmed' ? '<p>We look forward to seeing you!</p>' : ''}
        ${status === 'cancelled' ? '<p>If you have any questions, please contact us.</p>' : ''}
      `;

      await sendEmail(booking.student_email, {
        subject: emailSubject,
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel booking (teacher cancels)
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);
    
    if (!currentUser || currentUser.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get teacher_id
    const professional = db.prepare(
      'SELECT id, full_name FROM teachers WHERE user_id = ?'
    ).get(currentUser.userId) as { id: number; full_name: string } | undefined;

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Get booking details for email
    const booking = db.prepare(`
      SELECT 
        c.*,
        p.full_name as student_name,
        u.email as student_email
      FROM sessions c
      JOIN students p ON c.student_id = p.user_id
      JOIN users u ON p.user_id = u.id
      WHERE c.id = ? AND c.teacher_id = ?
    `).get(bookingId, professional.id) as any;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update status to cancelled
    db.prepare('UPDATE sessions SET status = ? WHERE id = ?').run('cancelled', bookingId);

    // Send cancellation email
    try {
      const emailSubject = `Session Cancelled - ${professional.full_name}`;
      const emailHtml = `
        <h2>Session Cancelled</h2>
        <p>Hello ${booking.student_name},</p>
        <p>We regret to inform you that your session with ${professional.full_name} has been cancelled.</p>
        <p><strong>Original Date:</strong> ${new Date(booking.scheduled_date).toLocaleDateString()}</p>
        <p><strong>Original Time:</strong> ${booking.scheduled_time}</p>
        <p>Please contact us if you have any questions or would like to reschedule.</p>
      `;

      await sendEmail(booking.student_email, {
        subject: emailSubject,
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
