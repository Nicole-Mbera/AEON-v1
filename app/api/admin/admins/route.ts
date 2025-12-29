import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole, hashPassword } from '@/lib/auth';
import db from '@/lib/db';

// Create a new admin
export async function POST(request: Request) {
  try {
    // Authenticate user
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { email, password, full_name, phone } = await request.json();

    // Validate input
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUserRes = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email]
    });

    if (existingUserRes.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and admin (Sequential operations instead of transaction for HTTP LibSQL)

    // 1. Create user
    const userRes = await db.execute({
      sql: `INSERT INTO users (email, password_hash, role, is_verified, is_active)
            VALUES (?, ?, 'admin', 1, 1)`,
      args: [email, passwordHash]
    });

    const userId = Number(userRes.lastInsertRowid);

    if (!userId) {
      throw new Error("Failed to retrieve created user ID");
    }

    // 2. Create admin profile
    await db.execute({
      sql: `INSERT INTO admins (user_id, full_name, phone)
            VALUES (?, ?, ?)`,
      args: [userId, full_name, phone || null]
    });

    // 3. Log activity
    await db.execute({
      sql: `INSERT INTO user_activity (user_id, activity_type, details)
            VALUES (?, 'admin_created', ?)`,
      args: [currentUser.userId, JSON.stringify({ new_admin_email: email })]
    });

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      data: { userId, email },
    }, { status: 201 });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all admins
export async function GET(request: Request) {
  try {
    // Authenticate user
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const adminsRes = await db.execute({
      sql: `SELECT 
        a.id,
        a.full_name,
        a.phone,
        u.email,
        u.is_active,
        u.created_at
      FROM admins a
      JOIN users u ON a.user_id = u.id
      ORDER BY u.created_at DESC`,
      args: []
    });

    return NextResponse.json({
      success: true,
      data: adminsRes.rows,
    });
  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
