import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/auth";
import client from "@/lib/db";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST(request: Request) {
    try {
        const user = getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { teacherId } = body;

        if (!teacherId) {
            return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
        }

        if (!stripe) {
            console.error("Stripe is not initialized");
            return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 });
        }

        // Fetch teacher details
        const teacherResult = await client.execute({
            sql: "SELECT * FROM teachers WHERE id = ?",
            args: [teacherId],
        });

        const teacher = teacherResult.rows[0] as any;

        if (!teacher) {
            return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
        }

        // Calculate amount and fee
        // Default to $60.00 (6000 cents) if not set
        const amount = teacher.monthly_fee || 6000;

        // Platform fee calculation (e.g., 30%)
        const platformFeePercent = 0.3;
        const applicationFeeAmount = Math.round(amount * platformFeePercent);

        const paymentIntentConfig: Stripe.PaymentIntentCreateParams = {
            amount: amount,
            currency: "usd",
            metadata: {
                teacher_id: teacherId.toString(),
                student_user_id: user.userId.toString(),
                purpose: "monthly_subscription",
            },
            automatic_payment_methods: {
                enabled: true,
            },
        };

        // If teacher has a connected Stripe account, route the funds
        if (teacher.stripe_account_id) {
            paymentIntentConfig.transfer_data = {
                destination: teacher.stripe_account_id,
            };
            paymentIntentConfig.application_fee_amount = applicationFeeAmount;
        }

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
            amount: amount,
        });

    } catch (error: any) {
        console.error("Payment intent creation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create payment intent" },
            { status: 500 }
        );
    }
}
