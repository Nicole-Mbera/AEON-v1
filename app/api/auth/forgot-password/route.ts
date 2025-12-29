
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const userRes = await db.execute({
            sql: 'SELECT id FROM users WHERE email = ?',
            args: [email]
        });
        const user = userRes.rows[0] as unknown as { id: number } | undefined;

        if (!user) {
            // Do not reveal if user exists
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link.'
            });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

        // Store token
        await db.execute({
            sql: `INSERT INTO password_resets (user_id, token, expires_at)
            VALUES (?, ?, ?)`,
            args: [user.id, token, expiresAt.toISOString()]
        });

        // Send email
        await sendPasswordResetEmail(email, token);

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
