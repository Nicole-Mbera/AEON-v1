
import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'teacher')) {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    // Get teacher ID
    const professionalRes = await db.execute({
      sql: 'SELECT id FROM teachers WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const professional = professionalRes.rows[0] as unknown as { id: number } | undefined;

    if (!professional) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let query = `
      SELECT 
        s.id,
        s.scheduled_date,
        s.scheduled_time,
        s.status,
        s.meeting_link,
        s.notes,
        p.full_name as student_name,
        p.phone as student_phone,
        u.email as student_email
      FROM sessions s
      JOIN students p ON s.student_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE s.teacher_id = ?
    `;

    const params: any[] = [professional.id];

    if (status && status !== 'all') {
      query += ' AND s.status = ?';
      params.push(status);
    }

    if (date) {
      query += ' AND s.scheduled_date = ?';
      params.push(date);
    }

    query += ' ORDER BY s.scheduled_date DESC, s.scheduled_time ASC';

    const bookingsRes = await db.execute({
      sql: query,
      args: params
    });

    return NextResponse.json({
      success: true,
      data: bookingsRes.rows,
    });

  } catch (error) {
    console.error('Get teacher bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update booking status (confirm, cancel, complete)
export async function PATCH(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'teacher')) {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    const { bookingId, status, meetingLink, notes } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const professionalRes = await db.execute({
      sql: 'SELECT id FROM teachers WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const professional = professionalRes.rows[0] as unknown as { id: number } | undefined;

    if (!professional) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const bookingRes = await db.execute({
      sql: `SELECT id FROM sessions WHERE id = ? AND teacher_id = ?`,
      args: [bookingId, professional.id]
    });
    const booking = bookingRes.rows[0];

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or not authorized' },
        { status: 404 }
      );
    }

    let updateQuery = 'UPDATE sessions SET status = ?';
    const updateParams: any[] = [status];

    if (meetingLink !== undefined) {
      updateQuery += ', meeting_link = ?';
      updateParams.push(meetingLink);
    }

    if (notes !== undefined) {
      updateQuery += ', notes = ?';
      updateParams.push(notes);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(bookingId);

    await db.execute({
      sql: updateQuery,
      args: updateParams
    });

    return NextResponse.json({
      success: true,
      message: `Booking ${status} successfully`,
    });

  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cancel booking
export async function DELETE(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'teacher')) {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Verify ownership
    const professionalRes = await db.execute({
      sql: 'SELECT id FROM teachers WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const professional = professionalRes.rows[0] as unknown as { id: number } | undefined;

    if (!professional) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

    const bookingRes = await db.execute({
      sql: `SELECT id FROM sessions WHERE id = ? AND teacher_id = ?`,
      args: [bookingId, professional.id]
    });
    const booking = bookingRes.rows[0];

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Soft delete or status 'cancelled'
    await db.execute({
      sql: 'UPDATE sessions SET status = ? WHERE id = ?',
      args: ['cancelled', bookingId]
    });

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
