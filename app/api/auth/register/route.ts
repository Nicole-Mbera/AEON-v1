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
      const existingUsername = patientQueries.checkUsernameAvailable.get(body.username);
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
    }

    // if email already exists
    const existingUser = userQueries.getUserByEmail.get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and role-specific profile in a transaction
    const transaction = db.transaction(() => {
      // Create user
      const userResult = userQueries.createUser.run(
        email,
        passwordHash,
        dbRole,
        role === 'student' ? 1 : 0, // auto-verify students
        1 // is_active
      );

      const userId = userResult.lastInsertRowid as number;

      // create role-specific profile
      if (role === 'student') {
        const { username, full_name, date_of_birth, gender, phone } = body;
        patientQueries.createPatient.run(
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

        // createProfessional expects: user_id, full_name, bio, specialization, years_of_experience, phone, profile_picture, license_number, institution_name, country, contact_email, mission, documents
        professionalQueries.createProfessional.run(
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

      return { userId, email, role };
    });

    const result = transaction();

    // generating token for all users
    const token = generateToken({
      userId: result.userId,
      email: result.email,
      role: role, // expose education role in token
    });

    return NextResponse.json({
      success: true,
      message: role === 'student'
        ? 'Account created successfully'
        : 'Account created. Pending verification.',
      token,
      user: {
        id: result.userId,
        email: result.email,
        role: role,
        isVerified: role === 'student' ? 1 : 0,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
