
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const teacherId = params.id;


        const teacher = db.prepare(`
        SELECT 
            id,
            full_name,
            bio,
            specialization,
            years_of_experience,
            profile_picture,
            average_rating,
            total_reviews,
            institution_name,
            contact_email
        FROM teachers
        WHERE id = ?
    `).get(teacherId);

        if (!teacher) {
            return NextResponse.json(
                { error: 'Teacher not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: teacher });

    } catch (error) {
        console.error('Error fetching teacher:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
