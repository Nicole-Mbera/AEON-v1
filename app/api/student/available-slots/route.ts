import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacher_id');
    const dateParam = searchParams.get('date');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    // 1. Get teacher's weekly schedule
    const schedules = db.prepare(`
      SELECT day_of_week, start_time, end_time 
      FROM availability_schedules 
      WHERE teacher_id = ? AND is_available = 1
    `).all(teacherId) as Array<{ day_of_week: number; start_time: string; end_time: string }>;

    // 2. Get existing bookings for the relevant period
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30); // Look 30 days ahead

    const bookings = db.prepare(`
      SELECT scheduled_date, scheduled_time, duration_minutes 
      FROM sessions 
      WHERE teacher_id = ? 
        AND status != 'cancelled'
        AND scheduled_date >= ?
        AND scheduled_date <= ?
    `).all(teacherId, today.toISOString().split('T')[0], endDate.toISOString().split('T')[0]) as Array<{ scheduled_date: string; scheduled_time: string; duration_minutes: number }>;

    // 3. Generate slots
    const slots = [];
    const currentDate = new Date(today);

    // If specific date requested, use that, otherwise generate for 30 days
    if (dateParam) {
      const requestedDate = new Date(dateParam);
      if (requestedDate >= today) {
        currentDate.setTime(requestedDate.getTime());
        endDate.setTime(requestedDate.getTime());
      } else {
        // Past date requested
        return NextResponse.json({ success: true, data: [] });
      }
    }

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday
      const dateStr = currentDate.toISOString().split('T')[0];

      // Find schedules for this day of week
      const daySchedules = schedules.filter(s => s.day_of_week === dayOfWeek);

      for (const schedule of daySchedules) {
        let timeStr = schedule.start_time;
        const endTimeStr = schedule.end_time;

        // Create Date objects for comparison logic (using arbitrary date 2000-01-01)
        while (timeStr < endTimeStr) {
          // Check for collision with bookings
          const isBooked = bookings.some(booking => {
            return booking.scheduled_date === dateStr && booking.scheduled_time === timeStr;
          });

          if (!isBooked) {
            // Determine end time of this slot (assuming 60 min slots based on schema default, or make dynamic)
            // For simplified logic, just mimicking the structure expected by frontend which seems to rely on start_time

            // Let's assume 1 hour slots for now
            const [h, m] = timeStr.split(':').map(Number);
            const startDt = new Date(2000, 0, 1, h, m);
            startDt.setHours(startDt.getHours() + 1); // +1 hour
            const slotEndTime = startDt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            if (slotEndTime <= endTimeStr) {
              slots.push({
                id: Math.random(), // Temporary ID since these aren't DB records
                teacher_id: parseInt(teacherId),
                slot_date: dateStr,
                start_time: timeStr,
                end_time: slotEndTime,
                is_booked: 0
              });
            }
          }

          // Increment by 1 hour
          const [h, m] = timeStr.split(':').map(Number);
          const dt = new Date(2000, 0, 1, h, m);
          dt.setHours(dt.getHours() + 1);
          timeStr = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      data: slots,
    });

  } catch (error) {
    console.error('Get available slots error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
