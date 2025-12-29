import { NextResponse } from 'next/server';
import { getUserFromRequest, hasAnyRole } from '@/lib/auth';
import { userQueries, patientQueries, professionalQueries, institutionalAdminQueries, systemAdminQueries } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Authenticate user
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile based on role
    let profile = null;

    switch (currentUser.role) {
      case 'student':
        profile = await patientQueries.getPatientByUserId(currentUser.userId);
        break;
      case 'teacher':
        profile = await professionalQueries.getProfessionalByUserId(currentUser.userId);
        break;
      case 'admin':
        profile = await systemAdminQueries.getAdminByUserId(currentUser.userId);
        break;
    }

    if (!profile) {
      // Return user info without profile if profile doesn't exist yet
      // This allows login to succeed even if profile is not fully set up
      return NextResponse.json({
        success: true,
        user: {
          userId: currentUser.userId,
          email: currentUser.email,
          role: currentUser.role,
          profile: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: currentUser.userId,
        email: currentUser.email,
        role: currentUser.role,
        profile,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Authenticate user
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // Update based on role
    switch (currentUser.role) {
      case 'student':
        // Students can only update username
        if (updates.username) {
          // Check if username is available
          const existing = await patientQueries.checkUsernameAvailable(updates.username) as any;
          const currentProfile = await patientQueries.getPatientByUserId(currentUser.userId) as any;

          if (existing && existing.id !== currentProfile?.id) {
            return NextResponse.json(
              { error: 'Username already taken' },
              { status: 409 }
            );
          }

          await patientQueries.updatePatient(
            updates.username,
            currentProfile.full_name,
            currentProfile.date_of_birth,
            currentProfile.grade_level,
            currentProfile.phone,
            currentProfile.profile_picture,
            currentUser.userId
          );
        }
        break;

      // Add other role update logic here
      default:
        return NextResponse.json(
          { error: 'Profile updates not implemented for this role' },
          { status: 501 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
