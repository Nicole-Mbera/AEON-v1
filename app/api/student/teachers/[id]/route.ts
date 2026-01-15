
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

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
            t.stripe_account_id,
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

        let isStripeOnboarded = false;

        if (teacher.stripe_account_id && stripe) {
            try {
                const account = await stripe.accounts.retrieve(teacher.stripe_account_id as string);
                if (account.capabilities?.transfers === 'active' && account.details_submitted) {
                    isStripeOnboarded = true;
                }
            } catch (e) {
                console.error("Stripe check failed for teacher " + teacherId, e);
            }
        }

        return NextResponse.json({ data: { ...teacher, is_onboarded: isStripeOnboarded } });

    } catch (error) {
        console.error('Error fetching teacher:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
