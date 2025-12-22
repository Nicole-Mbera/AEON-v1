import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';
import { sendEmail } from '@/lib/email';

// API for students to book sessions with teachers

// GET - Get available slots for a teacher
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacher_id');
    const date = searchParams.get('date');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    // Get teacher's availability for the given day
    const dayOfWeek = date ? new Date(date).getDay() : new Date().getDay();

    const availableSlots = db.prepare(`
      SELECT 
        id,
        day_of_week,
        start_time,
        end_time,
        is_available
      FROM availability_schedules
      WHERE teacher_id = ?
        AND day_of_week = ?
        AND is_available = 1
      ORDER BY start_time
    `).all(teacherId, dayOfWeek);

    // Get existing bookings for this date if provided
    let existingBookings: any[] = [];
    if (date) {
      existingBookings = db.prepare(`
        SELECT scheduled_time, duration_minutes
        FROM sessions
        WHERE teacher_id = ?
          AND date(scheduled_date) = date(?)
          AND status IN ('scheduled', 'confirmed')
      `).all(teacherId, date);
    }

    // Generate available time slots (15-minute intervals)
    const slots = availableSlots.flatMap((schedule: any) => {
      const start = schedule.start_time;
      const end = schedule.end_time;
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      const timeSlots = [];
      for (let time = startMinutes; time < endMinutes; time += 15) {
        const hours = Math.floor(time / 60);
        const mins = time % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

        // Check if this slot is not booked
        const isBooked = existingBookings.some((booking: any) => {
          const bookingTime = booking.scheduled_time;
          return bookingTime === timeString;
        });

        if (!isBooked) {
          timeSlots.push({
            time: timeString,
            formatted: formatTime(timeString),
            available: true,
          });
        }
      }

      return timeSlots;
    });

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

// POST - Book a session
export async function POST(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || currentUser.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized. Student access required.' },
        { status: 403 }
      );
    }

    const { teacher_id, scheduled_date, scheduled_time, duration_minutes, notes } = await request.json();

    // Validation
    if (!teacher_id || !scheduled_date || !scheduled_time) {
      return NextResponse.json(
        { error: 'Teacher ID, date, and time are required' },
        { status: 400 }
      );
    }

    // Get student info
    const student = db.prepare(`
      SELECT p.id, p.full_name, u.email
      FROM students p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `).get(currentUser.userId) as any;

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Get teacher info
    const teacher = db.prepare(`
      SELECT hp.id, hp.full_name, u.email
      FROM teachers hp
      JOIN users u ON hp.user_id = u.id
      WHERE hp.id = ?
    `).get(teacher_id) as any;

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Check for conflicts
    const conflict = db.prepare(`
      SELECT id FROM sessions
      WHERE teacher_id = ?
        AND date(scheduled_date) = date(?)
        AND scheduled_time = ?
        AND status IN ('scheduled', 'confirmed')
    `).get(teacher_id, scheduled_date, scheduled_time);

    if (conflict) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Generate unique Jitsi meeting link
    const sessionId = `aeon-${teacher_id}-${currentUser.userId}-${Date.now()}`;
    const jitsiLink = `https://meet.jit.si/${sessionId}`;

    // Create booking with Jitsi link
    const result = db.prepare(`
      INSERT INTO sessions (
        student_id,
        teacher_id,
        scheduled_date,
        scheduled_time,
        duration_minutes,
        status,
        meeting_link,
        notes,
        created_at
      ) VALUES (?, ?, ?, ?, ?, 'scheduled', ?, ?, CURRENT_TIMESTAMP)
    `).run(
      currentUser.userId,
      teacher_id,
      scheduled_date,
      scheduled_time,
      duration_minutes || 15,
      jitsiLink,
      notes || ''
    );

    // Send confirmation email to student
    try {
      const studentEmailSubject = `Session Confirmed - ${teacher.full_name}`;
      const studentEmailHtml = `
        <h2>Session Confirmed!</h2>
        <p>Hello ${student.full_name},</p>
        <p>Your session with ${teacher.full_name} has been confirmed.</p>
        <p><strong>Date:</strong> ${new Date(scheduled_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Time:</strong> ${formatTime(scheduled_time)}</p>
        <p><strong>Duration:</strong> ${duration_minutes || 15} minutes</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <div style="margin: 30px 0; padding: 20px; background: #f0f7ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Join Meeting</h3>
          <a href="${jitsiLink}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Join Video Call</a>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">Click the button above at your scheduled time to join the session</p>
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">Meeting Link: <a href="${jitsiLink}">${jitsiLink}</a></p>
      `;

      await sendEmail(student.email, {
        subject: studentEmailSubject,
        html: studentEmailHtml
      });

      // Send notification email to teacher
      const teacherEmailSubject = `New Booking - ${student.full_name}`;
      const teacherEmailHtml = `
        <h2>New Session Booked</h2>
        <p>Hello ${teacher.full_name},</p>
        <p>You have a new session booking from ${student.full_name}.</p>
        <p><strong>Date:</strong> ${new Date(scheduled_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Time:</strong> ${formatTime(scheduled_time)}</p>
        <p><strong>Duration:</strong> ${duration_minutes || 15} minutes</p>
        ${notes ? `<p><strong>Student Notes:</strong> ${notes}</p>` : ''}
        <div style="margin: 30px 0; padding: 20px; background: #f0f7ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Join Meeting</h3>
          <a href="${jitsiLink}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Join Video Call</a>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">Click the button above at the scheduled time to join the session</p>
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">Meeting Link: <a href="${jitsiLink}">${jitsiLink}</a></p>
      `;

      await sendEmail(teacher.email, {
        subject: teacherEmailSubject,
        html: teacherEmailHtml
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Session booked successfully',
      data: {
        id: result.lastInsertRowid,
      },
    });
  } catch (error) {
    console.error('Book session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel booking (student cancels)
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || currentUser.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized. Student access required.' },
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

    // Get booking details
    const booking = db.prepare(`
      SELECT 
        c.*,
        p.full_name as student_name,
        u.email as student_email,
        hp.full_name as teacher_name,
        u2.email as teacher_email
      FROM sessions c
      JOIN students p ON c.student_id = p.user_id
      JOIN users u ON p.user_id = u.id
      JOIN teachers hp ON c.teacher_id = hp.id
      JOIN users u2 ON hp.user_id = u2.id
      WHERE c.id = ? AND c.student_id = ?
    `).get(bookingId, currentUser.userId) as any;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update status to cancelled
    db.prepare('UPDATE sessions SET status = ? WHERE id = ?').run('cancelled', bookingId);

    // Send cancellation email to teacher
    try {
      const emailSubject = `Session Cancelled - ${booking.student_name}`;
      const emailHtml = `
        <h2>Session Cancelled</h2>
        <p>Hello ${booking.teacher_name},</p>
        <p>${booking.student_name} has cancelled their session.</p>
        <p><strong>Original Date:</strong> ${new Date(booking.scheduled_date).toLocaleDateString()}</p>
        <p><strong>Original Time:</strong> ${formatTime(booking.scheduled_time)}</p>
        <p>This time slot is now available for other students to book.</p>
      `;

      await sendEmail(booking.teacher_email, {
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
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
