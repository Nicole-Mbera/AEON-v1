
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const teacherId = params.id;


        const teacherRes = await db.execute({
            sql: `SELECT 
            t.id,
            t.full_name,
            t.bio,
            t.specialization,
            t.years_of_experience,
            t.profile_picture,
            t.average_rating,
            t.total_reviews,
            t.institution_name,
            t.consultation_fee,
            t.monthly_fee,
            COALESCE(t.contact_email, u.email) as contact_email
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = ?`,
            args: [teacherId]
        });
        const teacher = teacherRes.rows[0];

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
