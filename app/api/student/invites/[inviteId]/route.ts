import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// Respond to consultation invite (accept/decline)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    // Authenticate user
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'patient')) {
      return NextResponse.json(
        { error: 'Unauthorized. Patient access required.' },
        { status: 403 }
      );
    }

    const { inviteId } = await params;
    const inviteIdNum = parseInt(inviteId);
    const { action } = await request.json();

    // Validate action
    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (accept/decline) is required' },
        { status: 400 }
      );
    }

    // Get patient ID
    const patientQuery = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const patient = patientQuery.rows[0] as unknown as { id: number } | undefined;

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    // Verify invite belongs to patient
    // Note: The original query referenced 'consultation_attendees' but the invite creation in the other file 
    // uses 'invitations'. I will assume 'invitations' table based on the GET route in the parent folder,
    // OR this might be a legacy file.
    // However, looking at the other file (POST), it inserts into 'invitations'.
    // The GET route also reads from 'invitations'.
    // This file (PUT) reads from 'consultation_attendees'.
    // This looks like a mismatch in the original code, but I should stick to the pattern or fix it.
    // Actually, let me double check the POST route.
    // POST inserts into 'invitations'.
    // PATCH in POST route handles accept/decline for 'invitations'.
    // This [inviteId] route might be for a different purpose or older code.
    // Given the task is to fix "run does not exist", I will just convert this file's logic to async,
    // but I suspect this file might be deprecated or using a different table structure.
    // I will try to match the logic blindly first to fix the build.

    const inviteCheck = await db.execute({
      sql: `
      SELECT ca.id, c.meeting_link
      FROM consultation_attendees ca
      JOIN consultations c ON ca.consultation_id = c.id
      WHERE ca.id = ? AND ca.patient_id = ? AND ca.invitation_status = 'pending'
    `,
      args: [inviteIdNum, patient.id]
    });

    const invite = inviteCheck.rows[0] as any;

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found or already responded' },
        { status: 404 }
      );
    }

    // Update invitation status
    const status = action === 'accept' ? 'accepted' : 'declined';

    await db.execute({
      sql: `
      UPDATE consultation_attendees
      SET invitation_status = ?
      WHERE id = ?
    `,
      args: [status, inviteIdNum]
    });

    return NextResponse.json({
      success: true,
      message: `Invitation ${status}`,
      meeting_link: action === 'accept' ? invite.meeting_link : null,
    });
  } catch (error) {
    console.error('Respond to invite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
