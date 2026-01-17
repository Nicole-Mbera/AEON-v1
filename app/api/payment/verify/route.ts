import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/auth";
import db from "@/lib/db";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST(request: Request) {
    try {
        const user = getUserFromRequest(request);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { paymentIntentId } = await request.json();

        if (!paymentIntentId) {
            return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
        }

        if (!stripe) {
            return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
        }

        // Retreive payment intent from Stripe to verify status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
        }

        // Verify ownership (optional but recommended)
        // We check if the metadata.userId matches the logged in user
        if (paymentIntent.metadata.userId && paymentIntent.metadata.userId !== user.userId.toString()) {
            return NextResponse.json({ error: "Payment does not belong to this user" }, { status: 403 });
        }

        console.log(`Verifying payment ${paymentIntentId} for user ${user.userId}`);

        // Update database
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 days subscription

        try {
            await db.execute({
                sql: `UPDATE users SET subscription_status = 'active', subscription_end_date = ? WHERE id = ?`,
                args: [endDate.toISOString(), user.userId]
            });

            console.log(`Synchronously updated subscription for user ${user.userId}`);

            return NextResponse.json({ success: true });
        } catch (dbError) {
            console.error("Database update failed:", dbError);
            return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { error: error.message || "Verification failed" },
            { status: 500 }
        );
    }
}
