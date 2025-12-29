import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';
import db from '@/lib/db';

// POST /api/student/invites - Send invitation to another student
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Students only' }, { status: 403 });
    }

    const body = await req.json();
    const { recipientEmail, professionalId, message } = body;

    if (!recipientEmail || !professionalId) {
      return NextResponse.json({ error: 'Recipient email and professional ID required' }, { status: 400 });
    }

    // Get sender patient info
    const senderRes = await db.execute({
      sql: `
      SELECT p.id, p.full_name, u.email
      FROM students p
      JOIN users u ON p.user_id = u.id
      WHERE u.id = ?
    `,
      args: [decoded.userId]
    });
    const sender = senderRes.rows[0] as unknown as { id: number; full_name: string; email: string } | undefined;

    if (!sender) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // Get recipient patient info
    const recipientRes = await db.execute({
      sql: `
      SELECT p.id, p.full_name, u.email
      FROM students p
      JOIN users u ON p.user_id = u.id
      WHERE u.email = ?
    `,
      args: [recipientEmail]
    });
    const recipient = recipientRes.rows[0] as unknown as { id: number; full_name: string; email: string } | undefined;

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Get professional info
    const professionalRes = await db.execute({
      sql: `
      SELECT hp.id, hp.full_name
      FROM teachers hp
      WHERE hp.id = ?
    `,
      args: [professionalId]
    });
    const professional = professionalRes.rows[0] as unknown as { id: number; full_name: string } | undefined;

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
    }

    // Create invitation
    const result = await db.execute({
      sql: `
      INSERT INTO invitations (
        sender_student_id,
        recipient_student_id,
        teacher_id,
        message,
        status
      ) VALUES (?, ?, ?, ?, 'pending')
    `,
      args: [sender.id, recipient.id, professionalId, message || null]
    });

    const invitationId = Number(result.lastInsertRowid);

    // Send invitation email
    const acceptLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user/invites/accept?id=${invitationId}`;

    const emailTemplate = emailTemplates.invite({
      recipientName: recipient.full_name || recipient.email,
      senderName: sender.full_name || sender.email,
      mentorName: professional.full_name,
      message,
      acceptLink,
    });

    await sendEmail(recipient.email, emailTemplate);

    return NextResponse.json({
      message: 'Invitation sent successfully',
      invitationId,
    });

  } catch (error: any) {
    console.error('Send invitation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send invitation' }, { status: 500 });
  }
}

// GET /api/student/invites - Get invitations (sent and received)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Students only' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'sent' or 'received'

    // Get patient info
    const patientRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [decoded.userId]
    });
    const patient = patientRes.rows[0] as unknown as { id: number } | undefined;

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    let invitations: any[] = [];

    if (type === 'sent' || !type) {
      // Get sent invitations
      const sentRes = await db.execute({
        sql: `
        SELECT 
          i.id,
          i.message,
          i.status,
          i.created_at,
          i.responded_at,
          rp.full_name as recipient_name,
          ru.email as recipient_email,
          hp.full_name as professional_name,
          hp.specialization
        FROM invitations i
        JOIN students rp ON i.recipient_student_id = rp.id
        JOIN users ru ON rp.user_id = ru.id
        JOIN teachers hp ON i.teacher_id = hp.id
        WHERE i.sender_student_id = ?
        ORDER BY i.created_at DESC
      `,
        args: [patient.id]
      });
      const sent = sentRes.rows;

      invitations = [...invitations, ...sent.map((inv: any) => ({ ...inv, type: 'sent' }))];
    }

    if (type === 'received' || !type) {
      // Get received invitations
      const receivedRes = await db.execute({
        sql: `
        SELECT 
          i.id,
          i.message,
          i.status,
          i.created_at,
          i.responded_at,
          sp.full_name as sender_name,
          su.email as sender_email,
          hp.full_name as professional_name,
          hp.specialization,
          hp.id as teacher_id
        FROM invitations i
        JOIN students sp ON i.sender_student_id = sp.id
        JOIN users su ON sp.user_id = su.id
        JOIN teachers hp ON i.teacher_id = hp.id
        WHERE i.recipient_student_id = ?
        ORDER BY i.created_at DESC
      `,
        args: [patient.id]
      });
      const received = receivedRes.rows;

      invitations = [...invitations, ...received.map((inv: any) => ({ ...inv, type: 'received' }))];
    }

    return NextResponse.json({ invitations });

  } catch (error: any) {
    console.error('Get invitations error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get invitations' }, { status: 500 });
  }
}

// PATCH /api/student/invites - Accept or decline invitation
export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized - Students only' }, { status: 403 });
    }

    const body = await req.json();
    const { invitationId, action } = body; // action: 'accept' or 'decline'

    if (!invitationId || !action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get patient info
    const patientRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [decoded.userId]
    });
    const patient = patientRes.rows[0] as unknown as { id: number } | undefined;

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // Get invitation
    const invitationRes = await db.execute({
      sql: `
      SELECT 
        i.id,
        i.recipient_student_id,
        i.teacher_id,
        i.status
      FROM invitations i
      WHERE i.id = ? AND i.recipient_student_id = ?
    `,
      args: [invitationId, patient.id]
    });

    const invitation = invitationRes.rows[0] as unknown as {
      id: number;
      recipient_student_id: number;
      teacher_id: number;
      status: string;
    } | undefined;

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found or unauthorized' }, { status: 404 });
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation already responded to' }, { status: 400 });
    }

    if (action === 'decline') {
      // Simply update status to declined
      await db.execute({
        sql: `
        UPDATE invitations
        SET status = 'declined', responded_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        args: [invitationId]
      });

      return NextResponse.json({ message: 'Invitation declined' });
    }

    // Accept invitation - auto-book consultation
    // Find next available slot for this professional
    const availableSlotRes = await db.execute({
      sql: `
        SELECT 
          id,
          slot_date,
          start_time,
          end_time
        FROM availability_slots
        WHERE teacher_id = ? 
          AND is_booked = 0
          AND slot_date >= date('now')
        ORDER BY slot_date ASC, start_time ASC
        LIMIT 1
      `,
      args: [invitation.teacher_id]
    });

    const availableSlot = availableSlotRes.rows[0] as unknown as {
      id: number;
      slot_date: string;
      start_time: string;
      end_time: string;
    } | undefined;

    if (!availableSlot) {
      throw new Error('No available slots for this professional');
    }

    // Generate Jitsi room
    const jitsiRoomId = `bodywise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const meetingLink = `https://meet.jit.si/${jitsiRoomId}`;

    // Create consultation
    const consultResult = await db.execute({
      sql: `
        INSERT INTO consultations (
          student_id,
          teacher_id,
          slot_id,
          scheduled_date,
          scheduled_time,
          duration_minutes,
          meeting_link,
          jitsi_room_id,
          status
        ) VALUES (?, ?, ?, ?, ?, 30, ?, ?, 'scheduled')
      `,
      args: [
        patient.id,
        invitation.teacher_id,
        availableSlot.id,
        availableSlot.slot_date,
        availableSlot.start_time,
        meetingLink,
        jitsiRoomId
      ]
    });

    const consultationId = Number(consultResult.lastInsertRowid);
    if (!consultationId) throw new Error('Failed to create consultation ID');

    // Mark slot as booked
    await db.execute({
      sql: 'UPDATE availability_slots SET is_booked = 1 WHERE id = ?',
      args: [availableSlot.id]
    });

    // Update invitation
    await db.execute({
      sql: `
        UPDATE invitations
        SET status = 'accepted', 
            consultation_id = ?, 
            responded_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [consultationId, invitationId]
    });

    // Schedule confirmation email
    const patientEmailRes = await db.execute({
      sql: `
        SELECT u.email, p.full_name
        FROM users u
        JOIN students p ON u.id = p.user_id
        WHERE p.id = ?
      `,
      args: [patient.id]
    });
    const patientEmail = patientEmailRes.rows[0] as unknown as { email: string; full_name: string } | undefined;

    const professionalDataRes = await db.execute({
      sql: `
        SELECT hp.full_name, u.email
        FROM teachers hp
        JOIN users u ON hp.user_id = u.id
        WHERE hp.id = ?
      `,
      args: [invitation.teacher_id]
    });
    const professionalData = professionalDataRes.rows[0] as unknown as { full_name: string; email: string } | undefined;

    if (patientEmail && professionalData) {
      await db.execute({
        sql: `
          INSERT INTO email_reminders (
            consultation_id,
            recipient_email,
            reminder_type,
            scheduled_time,
            status
          ) VALUES (?, ?, 'confirmation', datetime('now'), 'pending')
        `,
        args: [consultationId, patientEmail.email]
      });

      // 24-hour reminder
      const consultDateTime = new Date(`${availableSlot.slot_date}T${availableSlot.start_time}`);
      const reminder24h = new Date(consultDateTime);
      reminder24h.setHours(reminder24h.getHours() - 24);

      if (reminder24h > new Date()) {
        await db.execute({
          sql: `
            INSERT INTO email_reminders (
              consultation_id,
              recipient_email,
              reminder_type,
              scheduled_time,
              status
            ) VALUES (?, ?, '24hr', ?, 'pending')
          `,
          args: [consultationId, patientEmail.email, reminder24h.toISOString()]
        });
      }
    }

    return NextResponse.json({
      message: 'Invitation accepted and consultation automatically booked!',
      consultation: {
        consultationId,
        meetingLink,
        scheduledDate: availableSlot.slot_date,
        scheduledTime: availableSlot.start_time,
      },
    });

  } catch (error: any) {
    console.error('Respond to invitation error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to respond to invitation'
    }, { status: 500 });
  }
}
