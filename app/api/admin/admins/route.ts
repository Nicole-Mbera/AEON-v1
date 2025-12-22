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
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user and admin in transaction
    const transaction = db.transaction(() => {
      // Create user
      const insertUser = db.prepare(`
        INSERT INTO users (email, password_hash, role, is_verified, is_active)
        VALUES (?, ?, 'admin', 1, 1)
      `);
      
      const userResult = insertUser.run(email, passwordHash);
      const userId = userResult.lastInsertRowid as number;
      
      // Create admin profile
      const insertAdmin = db.prepare(`
        INSERT INTO admins (user_id, full_name, phone)
        VALUES (?, ?, ?)
      `);
      
      insertAdmin.run(userId, full_name, phone || null);
      
      // Log activity
      db.prepare(`
        INSERT INTO user_activity (user_id, activity_type, details)
        VALUES (?, 'admin_created', ?)
      `).run(currentUser.userId, JSON.stringify({ new_admin_email: email }));
      
      return { userId, email };
    });
    
    const result = transaction();
    
    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      data: result,
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
    
    const adminsQuery = db.prepare(`
      SELECT 
        a.id,
        a.full_name,
        a.phone,
        u.email,
        u.is_active,
        u.created_at
      FROM admins a
      JOIN users u ON a.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    
    const admins = adminsQuery.all();
    
    return NextResponse.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
