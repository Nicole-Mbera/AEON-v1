import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// Invite another patient to group session
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const consultationId = parseInt(id);
    const { patient_username } = await request.json();

    // Validate input
    if (!patient_username) {
      return NextResponse.json(
        { error: 'Patient username is required' },
        { status: 400 }
      );
    }

    // Get current patient ID
    const currentPatientRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const currentPatient = currentPatientRes.rows[0] as unknown as { id: number } | undefined;

    if (!currentPatient) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    // Verify consultation exists and belongs to current patient
    const consultationCheckRes = await db.execute({
      sql: `
      SELECT id FROM consultations
      WHERE id = ? AND student_id = ? AND status = 'scheduled'
    `,
      args: [consultationId, currentPatient.id]
    });

    if (consultationCheckRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Consultation not found or you do not have permission' },
        { status: 404 }
      );
    }

    // Find invited patient by username
    const invitedPatientRes = await db.execute({
      sql: 'SELECT id FROM students WHERE username = ?',
      args: [patient_username]
    });
    const invitedPatient = invitedPatientRes.rows[0] as unknown as { id: number } | undefined;

    if (!invitedPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Check if already invited
    const existingInviteRes = await db.execute({
      sql: `
      SELECT id FROM consultation_attendees
      WHERE consultation_id = ? AND patient_id = ?
    `,
      args: [consultationId, invitedPatient.id]
    });
    const existingInvite = existingInviteRes.rows[0];

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Patient already invited to this consultation' },
        { status: 409 }
      );
    }

    // Create invitation
    await db.execute({
      sql: `
      INSERT INTO consultation_attendees (consultation_id, patient_id, invitation_status)
      VALUES (?, ?, 'pending')
    `,
      args: [consultationId, invitedPatient.id]
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Invite patient error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get consultation invites for current patient
export async function GET(request: Request) {
  try {
    // Authenticate user
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'patient')) {
      return NextResponse.json(
        { error: 'Unauthorized. Patient access required.' },
        { status: 403 }
      );
    }

    // Get patient ID
    const patientRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const patient = patientRes.rows[0] as unknown as { id: number } | undefined;

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    // Get pending invitations
    const invitesRes = await db.execute({
      sql: `
      SELECT 
        ca.id,
        ca.invitation_status,
        ca.invited_at,
        c.id as consultation_id,
        c.scheduled_date,
        c.scheduled_time,
        c.duration_minutes,
        hp.full_name as professional_name,
        hp.specialization,
        p.username as invited_by
      FROM consultation_attendees ca
      JOIN consultations c ON ca.consultation_id = c.id
      JOIN teachers hp ON c.teacher_id = hp.id
      JOIN students p ON c.student_id = p.id
      WHERE ca.patient_id = ? AND ca.invitation_status = 'pending'
      ORDER BY ca.invited_at DESC
    `,
      args: [patient.id]
    });

    const invites = invitesRes.rows;

    return NextResponse.json({
      success: true,
      data: invites,
    });
  } catch (error) {
    console.error('Get invites error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
