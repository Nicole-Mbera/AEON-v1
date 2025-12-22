import { NextResponse } from 'next/server';
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
    
    if (action === 'approve') {
      // Approve the teacher by setting is_verified = 1
      db.prepare(`
        UPDATE users 
        SET is_verified = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(user_id);
      
      // Log the approval
      db.prepare(`
        INSERT INTO user_activity (user_id, activity_type, details)
        VALUES (?, 'teacher_approved', ?)
      `).run(
        currentUser.userId,
        JSON.stringify({ 
          approved_teacher_id: teacher_id,
          approved_user_id: user_id,
          timestamp: new Date().toISOString()
        })
      );
      
      return NextResponse.json({
        success: true,
        message: 'Teacher approved successfully',
      });
    } else if (action === 'reject') {
      // Deactivate the user account
      db.prepare(`
        UPDATE users 
        SET is_active = 0, is_verified = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(user_id);
      
      // Log the rejection
      db.prepare(`
        INSERT INTO user_activity (user_id, activity_type, details)
        VALUES (?, 'teacher_rejected', ?)
      `).run(
        currentUser.userId,
        JSON.stringify({ 
          rejected_teacher_id: teacher_id,
          rejected_user_id: user_id,
          reason: reason || 'No reason provided',
          timestamp: new Date().toISOString()
        })
      );
      
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
