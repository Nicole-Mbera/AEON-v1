import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// POST /api/student/assessment - Submit English proficiency assessment
export async function POST(request: Request) {
    try {
        const currentUser = getUserFromRequest(request);

        if (!currentUser || !hasRole(currentUser, 'student')) {
            return NextResponse.json(
                { error: 'Unauthorized. Student access required.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { english_proficiency, proficiency_certificate } = body;

        if (!english_proficiency || !['beginner', 'intermediate', 'advanced'].includes(english_proficiency)) {
            return NextResponse.json(
                { error: 'Invalid proficiency level.' },
                { status: 400 }
            );
        }

        if (english_proficiency !== 'beginner' && !proficiency_certificate) {
            return NextResponse.json(
                { error: 'Certificate required for Intermediate or Advanced levels.' },
                { status: 400 }
            );
        }

        // Get student ID (optional verify if exists first, but we rely on user_id)
        const studentRes = await db.execute({
            sql: 'SELECT id FROM students WHERE user_id = ?',
            args: [currentUser.userId]
        });
        const student = studentRes.rows[0] as unknown as { id: number } | undefined;

        if (!student) {
            return NextResponse.json(
                { error: 'Student profile not found.' },
                { status: 404 }
            );
        }

        await db.execute({
            sql: `UPDATE students 
                  SET english_proficiency = ?, proficiency_certificate = ?
                  WHERE id = ?`,
            args: [english_proficiency, proficiency_certificate || null, student.id]
        });

        return NextResponse.json({
            success: true,
            message: 'Assessment submitted successfully'
        });

    } catch (error) {
        console.error('Submit assessment error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
