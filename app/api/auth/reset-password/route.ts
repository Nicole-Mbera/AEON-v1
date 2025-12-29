
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // 1. Find user with valid token and unexpired time
        // Note: We need to handle SQLite date checking carefully. 
        // Since we stored expires as number (Date.now() + 3600000), we can just compare integers.
        const userRes = await db.execute({
            sql: `
      SELECT id 
      FROM users 
      WHERE reset_password_token = ? 
      AND reset_password_expires > ?
    `,
            args: [token, Date.now()]
        });
        const user = userRes.rows[0] as unknown as { id: number } | undefined;

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired password reset token' },
                { status: 400 }
            );
        }

        // 2. Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Update user password and clear token
        await db.execute({
            sql: `
      UPDATE users 
      SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL
      WHERE id = ?
    `,
            args: [passwordHash, user.id]
        });

        return NextResponse.json({ success: true, message: 'Password has been reset successfully' });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
