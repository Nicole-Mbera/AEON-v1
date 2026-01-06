
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

        // 1. Find valid reset token
        const resetRes = await db.execute({
            sql: `
      SELECT user_id 
      FROM password_resets 
      WHERE token = ? 
      AND expires_at > ?
    `,
            args: [token, new Date().toISOString()]
        });
        const resetRecord = resetRes.rows[0] as unknown as { user_id: number } | undefined;

        if (!resetRecord) {
            return NextResponse.json(
                { error: 'Invalid or expired password reset token' },
                { status: 400 }
            );
        }

        // 2. Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Update user password
        await db.execute({
            sql: `
      UPDATE users 
      SET password_hash = ?
      WHERE id = ?
    `,
            args: [passwordHash, resetRecord.user_id]
        });

        // 4. Delete used token
        await db.execute({
            sql: 'DELETE FROM password_resets WHERE token = ?',
            args: [token]
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
