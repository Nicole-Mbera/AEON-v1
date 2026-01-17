import { NextResponse } from 'next/server';
import { getUserFromRequest, generateToken } from '@/lib/auth';
import { userQueries } from '@/lib/db';

export async function POST(request: Request) {
    try {
        // Get current user from token
        const currentUser = getUserFromRequest(request);

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch latest user data from database
        const user = await userQueries.getUserById(currentUser.userId) as any;

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Map DB roles to UI roles (consistency with auth.ts)
        const roleMap: Record<string, 'student' | 'teacher' | 'admin'> = {
            'student': 'student',
            'teacher': 'teacher',
            'admin': 'admin',
        };
        const mappedRole = roleMap[user.role] || 'student';

        // Generate new token with updated subscription status
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: mappedRole,
            subscription_status: user.subscription_status,
        });

        // Create response
        const response = NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: mappedRole,
                isVerified: user.is_verified,
                subscription_status: user.subscription_status,
            },
        });

        // Set new httpOnly cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Session refresh error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
