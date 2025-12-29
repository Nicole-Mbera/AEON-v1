import { NextResponse } from 'next/server';
import { hashPassword, generateToken } from '@/lib/auth';
import { userQueries, patientQueries, professionalQueries, institutionalAdminQueries } from '@/lib/db';
import db from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { validateRequest, registerSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 attempts per 5 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(`register:${clientIp}`, {
      interval: 300000, // 5 minutes
      uniqueTokenPerInterval: 3,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many registration attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          },
        }
      );
    }

    // Validate request body with Zod
    const validation = await validateRequest(request, registerSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const body = validation.data;
    const { email, password, role } = body; // role is 'student' | 'teacher'

    // Use education roles directly in database
    const dbRole = role; // 'student' | 'teacher'

    // Check username availability for students
    if (role === 'student' && body.username) {
      const existingUsername = await patientQueries.checkUsernameAvailable(body.username);
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
    }

    // if email already exists
    const existingUser = await userQueries.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and role-specific profile manually (LibSQL/HTTP stateless doesn't support interactive transactions easily without interactive transactions mode, so we'll do sequential for now or use batch if needed)
    // For now, robust sequential operations. If user creation fails, we stop. If profile creation fails, we have an orphan user (can be cleaned up or use batch)

    // 1. Create User
    const userResult = await userQueries.createUser(
      email,
      passwordHash,
      dbRole,
      role === 'student' ? 1 : 0, // auto-verify students
      1 // is_active
    );

    // Get the inserted ID. LibSQL result has `lastInsertRowid` usually if supported by the protocol, or we might need to query it back.
    // For Turso/LibSQL over HTTP, lastInsertRowid is often present in the result.
    let userId = userResult.lastInsertRowid ? Number(userResult.lastInsertRowid) : 0;

    if (!userId) {
      // Fallback if lastInsertRowid is missing (depends on adapter version), fetch by email
      const u = await userQueries.getUserByEmail(email);
      if (!u) throw new Error("Failed to retrieve created user");
      userId = Number(u.id);
    }

    // 2. Create Role Specific Profile
    if (role === 'student') {
      const { username, full_name, date_of_birth, gender, phone } = body;
      await patientQueries.createPatient(
        userId,
        username,
        full_name || null,
        date_of_birth || null,
        gender || null,
        phone || null,
        null  // profile_picture
      );
    } else if (role === 'teacher') {
      const {
        full_name,
        specialization,
        years_of_experience,
        bio,
        phone,
        license_number,
        institution_name,
        country,
        contact_email,
        mission,
        documents
      } = body;

      await professionalQueries.createProfessional(
        userId,
        full_name,
        bio || null,
        specialization,
        years_of_experience || 0,
        phone || null,
        null,  // profile_picture
        license_number || null,
        institution_name || null,
        country || null,
        contact_email || null,
        mission || null,
        documents ? JSON.stringify(documents) : null
      );
    }

    // generating token for all users
    const token = generateToken({
      userId: userId,
      email: email,
      role: role, // expose education role in token
    });

    const response = NextResponse.json({
      success: true,
      message: role === 'student'
        ? 'Account created successfully'
        : 'Account created. Pending verification.',
      token,
      user: {
        id: userId,
        email: email,
        role: role,
        isVerified: role === 'student' ? 1 : 0,
      },
    }, { status: 201 });

    // Set httpOnly cookie for API authentication
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
