import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/teacher/profile - Get current teacher profile
export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const teacherRes = await db.execute({
      sql: `SELECT t.*, u.email FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.user_id = ?`,
      args: [currentUser.userId]
    });
    const teacher = teacherRes.rows[0];

    if (!teacher) {
      // Auto-heal: Create orphan teacher profile
      console.log(`[Profile] Orphan teacher user ${currentUser.userId} detected. Creating placeholder profile.`);

      try {
        await db.execute({
          sql: `INSERT INTO teachers (user_id, full_name, contact_email) VALUES (?, ?, ?)`,
          args: [currentUser.userId, 'New Teacher', currentUser.email || null]
        });
        console.log(`[Profile] Insert successful.`);
      } catch (err) {
        console.error(`[Profile] Insert failed:`, err);
      }

      // Fetch again if RETURNING failed or we didn't use it
      const retryRes = await db.execute({
        sql: `SELECT * FROM teachers WHERE user_id = ?`,
        args: [currentUser.userId]
      });

      return NextResponse.json({
        success: true,
        data: retryRes.rows[0]
      });
    }

    return NextResponse.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/teacher/profile - Update teacher profile
export async function PUT(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      full_name,
      phone,
      specialization,
      bio,
      years_of_experience,
      institution_name,
      license_number,
      country,
      mission
    } = body;

    // Check if teacher profile exists
    const teacherRes = await db.execute({
      sql: 'SELECT id FROM teachers WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const teacher = teacherRes.rows[0];

    if (teacher) {
      // Update
      await db.execute({
        sql: `UPDATE teachers SET
              full_name = COALESCE(?, full_name),
              phone = COALESCE(?, phone),
              specialization = COALESCE(?, specialization),
              bio = COALESCE(?, bio),
              years_of_experience = COALESCE(?, years_of_experience),
              institution_name = COALESCE(?, institution_name),
              license_number = COALESCE(?, license_number),
              country = COALESCE(?, country),
              mission = COALESCE(?, mission)
            WHERE user_id = ?`,
        args: [
          full_name, phone, specialization, bio, years_of_experience,
          institution_name, license_number, country, mission,
          currentUser.userId
        ]
      });
    } else {
      // Create (Should ideally happen at registration, but fallback here)
      await db.execute({
        sql: `INSERT INTO teachers (
              user_id, full_name, phone, specialization, bio, 
              years_of_experience, institution_name, license_number, 
              country, mission
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          currentUser.userId, full_name, phone, specialization, bio,
          years_of_experience, institution_name, license_number,
          country, mission
        ]
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update teacher profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
