
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
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

        // 1. Check if user exists
        const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: number } | undefined;

        if (!user) {
            // Return success even if user doesn't exist to prevent email enumeration
            return NextResponse.json({ success: true, message: 'If an account exists with this email, a reset link has been sent.' });
        }

        // 2. Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 3600000; // 1 hour from now

        // 3. Save token to database
        db.prepare(`
      UPDATE users 
      SET reset_password_token = ?, reset_password_expires = ?
      WHERE id = ?
    `).run(token, expires, user.id);

        // 4. Send email
        const emailResult = await sendPasswordResetEmail(email, token);

        if (!emailResult.success) {
            console.error('Failed to send reset email:', emailResult.error);
            return NextResponse.json(
                { error: 'Failed to send reset email' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'If an account exists with this email, a reset link has been sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
