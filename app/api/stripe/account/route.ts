
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/auth";
import client from "@/lib/db";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST(request: Request) {
    try {
        const user = getUserFromRequest(request);
        if (!user || user.role !== 'teacher') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!stripe) {
            return NextResponse.json({ error: "Stripe configuration missing" }, { status: 503 });
        }

        // 1. Get Teacher Profile
        const teacherRes = await client.execute({
            sql: "SELECT * FROM teachers WHERE user_id = ?",
            args: [user.userId],
        });
        const teacher = teacherRes.rows[0] as any;

        if (!teacher) {
            return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
        }

        let accountId = teacher.stripe_account_id;

        // 2. Create Stripe Account if doesn't exist
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express",
                country: "US", // Defaulting to US for now, could be dynamic
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            accountId = account.id;

            // Save to DB
            await client.execute({
                sql: "UPDATE teachers SET stripe_account_id = ? WHERE id = ?",
                args: [accountId, teacher.id],
            });
        }

        // 3. Create Account Link
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${request.headers.get("origin")}/teacher`, // Redirect back to dashboard on failure/reauth
            return_url: `${request.headers.get("origin")}/api/stripe/return?account_id=${accountId}`, // Handler for success
            type: "account_onboarding",
        });

        return NextResponse.json({
            url: accountLink.url,
            account_id: accountId
        });

    } catch (error: any) {
        console.error("Stripe Onboarding Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create onboarding link" },
            { status: 500 }
        );
    }
}
