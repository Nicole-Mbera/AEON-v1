import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// GET - Get teacher's schedules
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
    const professionalRes = await db.execute({
      sql: 'SELECT id FROM teachers WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const professional = professionalRes.rows[0] as unknown as { id: number } | undefined;

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const includeBookings = searchParams.get('include_bookings') === 'true';

    // Get all schedules for this professional
    const schedulesRes = await db.execute({
      sql: `SELECT 
        id,
        day_of_week,
        start_time,
        end_time,
        is_available
      FROM availability_schedules
      WHERE teacher_id = ?
      ORDER BY day_of_week, start_time`,
      args: [professional.id]
    });
    const schedules = schedulesRes.rows;

    let bookings: any[] = [];
    if (includeBookings && startDate && endDate) {
      // Get bookings for the date range
      const bookingsRes = await db.execute({
        sql: `SELECT 
          c.id,
          c.scheduled_date,
          c.scheduled_time,
          c.duration_minutes,
          c.status,
          c.meeting_link,
          p.full_name as student_name,
          p.username as student_username,
          p.profile_picture as student_picture
        FROM sessions c
        JOIN students p ON c.student_id = p.id
        WHERE c.teacher_id = ?
          AND date(c.scheduled_date) >= date(?)
          AND date(c.scheduled_date) <= date(?)
          AND c.status IN ('scheduled', 'confirmed')
        ORDER BY c.scheduled_date, c.scheduled_time`,
        args: [professional.id, startDate, endDate]
      });
      bookings = bookingsRes.rows;
    }

    return NextResponse.json({
      success: true,
      data: {
        schedules,
        bookings,
      },
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new schedule
export async function POST(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || currentUser.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher access required.' },
        { status: 403 }
      );
    }

    const { day_of_week, start_time, end_time } = await request.json();

    // Validate input
    if (day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Day of week, start time, and end time are required' },
        { status: 400 }
      );
    }

    if (day_of_week < 0 || day_of_week > 6) {
      return NextResponse.json(
        { error: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' },
        { status: 400 }
      );
    }

    // Get teacher_id
    const professionalRes = await db.execute({
      sql: 'SELECT id FROM teachers WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const professional = professionalRes.rows[0] as unknown as { id: number } | undefined;

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Check for conflicts
    const conflictRes = await db.execute({
      sql: `SELECT id FROM availability_schedules
      WHERE teacher_id = ?
        AND day_of_week = ?
        AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )`,
      args: [
        professional.id,
        day_of_week,
        start_time, start_time,
        end_time, end_time,
        start_time, end_time
      ]
    });

    if (conflictRes.rows.length > 0) {
      return NextResponse.json(
        { error: 'This time slot conflicts with an existing schedule' },
        { status: 409 }
      );
    }

    // Insert schedule
    const insertRes = await db.execute({
      sql: `INSERT INTO availability_schedules (teacher_id, day_of_week, start_time, end_time, is_available)
      VALUES (?, ?, ?, ?, 1)`,
      args: [professional.id, day_of_week, start_time, end_time]
    });

    return NextResponse.json({
      success: true,
      message: 'Schedule created successfully',
      data: {
        id: insertRes.lastInsertRowid,
        day_of_week,
        start_time,
        end_time,
        is_available: true,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a schedule
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
    const scheduleId = searchParams.get('id');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Get teacher_id
    const professionalRes = await db.execute({
      sql: 'SELECT id FROM teachers WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const professional = professionalRes.rows[0] as unknown as { id: number } | undefined;

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    const scheduleRes = await db.execute({
      sql: 'SELECT id FROM availability_schedules WHERE id = ? AND teacher_id = ?',
      args: [scheduleId, professional.id]
    });

    if (scheduleRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Schedule not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete schedule
    await db.execute({
      sql: 'DELETE FROM availability_schedules WHERE id = ?',
      args: [scheduleId]
    });

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
