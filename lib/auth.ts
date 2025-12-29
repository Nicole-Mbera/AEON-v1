import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { userQueries, systemAdminQueries } from '@/lib/db';
import { jwtVerify } from 'jose';

// Enforce JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET environment variable is not set in production. Secure authentication will fail.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

// generating JWT token
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// verifying JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Edge-compatible JWT verification using jose
export async function verifyTokenEdge(token: string): Promise<any> {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return verified.payload;
  } catch (err) {
    return null;
  }
}

// hashing the password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// authenticate
export async function authenticateUser(email: string, password: string) {
  try {
    const user = await userQueries.getUserByEmail(email) as any;

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    if (!user.is_active) {
      return { success: false, message: 'Account is inactive' };
    }

    // Check if teacher account is verified
    if (user.role === 'teacher' && !user.is_verified) {
      return { success: false, message: 'Your account is pending admin approval. Please wait for verification.' };
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Map DB roles to UI roles (support both old and new schema)
    const roleMap: Record<string, 'student' | 'teacher' | 'admin'> = {
      'student': 'student',
      'teacher': 'teacher',
      'admin': 'admin',
    };
    const mappedRole = roleMap[user.role] || 'student';

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: mappedRole,
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: mappedRole,
        isVerified: user.is_verified,
      },
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { success: false, message: 'Authentication failed' };
  }
}

export async function getUserFromToken(token: string) {
  try {
    // We can't verify types strictly here without Zod, casting as any
    const payload = verifyToken(token) as any;

    if (!payload?.userId) {
      return null;
    }

    const user = await userQueries.getUserById(payload.userId) as any;

    if (!user) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;

  } catch (error) {
    return null;
  }
}

export async function isAdmin(userId: number): Promise<boolean> {
  try {
    const user = await userQueries.getUserById(userId) as any;
    return user?.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function isSystemAdmin(userId: number): Promise<boolean> {
  try {
    const admin = await systemAdminQueries.getAdminByUserId(userId);
    return !!admin;
  } catch (error) {
    return false;
  }
}

// middleware helper to get user from request
export function getUserFromRequest(request: Request): any {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // If no Authorization header, try to get token from cookie
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((c: string) => {
        const [key, ...v] = c.split('=');
        return [key, v.join('=')];
      })
    );

    if (cookies.token) {
      return verifyToken(cookies.token);
    }
  }

  return null;
}

// role-based authorization
export function authorizeRoles(...roles: string[]) {
  return (user: any): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };
}

// if user has role
export function hasRole(user: any, role: string): boolean {
  return user?.role === role;
}

// if user has any of the roles
export function hasAnyRole(user: any, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
