import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/teacher/profile
export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get teacher profile
    const teacher = db.prepare(`
      SELECT 
        t.id,
        t.user_id,
        t.full_name,
        t.specialization,
        t.bio,
        t.years_of_experience,
        t.phone,
        t.profile_picture,
        t.average_rating,
        t.total_reviews,
        u.email
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ?
    `).get(currentUser.userId) as any;

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: teacher,
    });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/teacher/profile
export async function PATCH(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { full_name, specialization, bio, years_of_experience, phone, profile_picture } = body;

    // Update teacher profile
    const updateStmt = db.prepare(`
      UPDATE teachers
      SET 
        full_name = COALESCE(?, full_name),
        specialization = COALESCE(?, specialization),
        bio = COALESCE(?, bio),
        years_of_experience = COALESCE(?, years_of_experience),
        phone = COALESCE(?, phone),
        profile_picture = COALESCE(?, profile_picture)
      WHERE user_id = ?
    `);

    updateStmt.run(
      full_name || null,
      specialization || null,
      bio || null,
      years_of_experience || null,
      phone || null,
      profile_picture || null,
      currentUser.userId
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update teacher profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
