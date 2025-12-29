import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// Approve or reject teacher registration
export async function POST(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { teacher_id, user_id, action, reason } = await request.json();

    if (!teacher_id || !user_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch user email and teacher details for notification
    const userDataRes = await db.execute({
      sql: `SELECT u.email, t.full_name 
      FROM users u 
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE u.id = ?`,
      args: [user_id]
    });
    const userData = userDataRes.rows[0] as unknown as { email: string; full_name: string } | undefined;

    const teacherName = userData?.full_name || 'Teacher';
    const teacherEmail = userData?.email;

    // Dynamically import email functions to avoid circular deps if any
    const { sendTeacherApprovalEmail, sendTeacherRejectionEmail } = await import('@/lib/email');

    if (action === 'approve') {
      // Approve the teacher by setting is_verified = 1 and is_active = 1
      await db.execute({
        sql: `UPDATE users 
        SET is_verified = 1, is_active = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        args: [user_id]
      });

      // Log the approval
      await db.execute({
        sql: `INSERT INTO user_activity (user_id, activity_type, details)
        VALUES (?, 'teacher_approved', ?)`,
        args: [currentUser.userId, JSON.stringify({
          approved_teacher_id: teacher_id,
          approved_user_id: user_id,
          timestamp: new Date().toISOString()
        })]
      });

      // Send approval email
      if (teacherEmail) {
        await sendTeacherApprovalEmail({
          to: teacherEmail,
          teacherName: teacherName,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Teacher approved successfully',
      });
    } else if (action === 'reject') {
      // Deactivate the user account
      await db.execute({
        sql: `UPDATE users 
        SET is_active = 0, is_verified = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        args: [user_id]
      });

      // Log the rejection
      await db.execute({
        sql: `INSERT INTO user_activity (user_id, activity_type, details)
        VALUES (?, 'teacher_rejected', ?)`,
        args: [currentUser.userId, JSON.stringify({
          rejected_teacher_id: teacher_id,
          rejected_user_id: user_id,
          reason: reason || 'No reason provided',
          timestamp: new Date().toISOString()
        })]
      });

      // Send rejection email
      if (teacherEmail) {
        await sendTeacherRejectionEmail({
          to: teacherEmail,
          teacherName: teacherName,
          reason: reason || 'Application criteria not met',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Teacher registration rejected',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Teacher approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
