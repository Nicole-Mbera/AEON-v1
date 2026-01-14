
import { NextResponse } from "next/server";
import Stripe from "stripe";
import client from "@/lib/db";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get("account_id");

        if (!accountId) {
            return NextResponse.redirect(new URL("/teacher?error=missing_account", request.url));
        }

        if (!stripe) {
            return NextResponse.redirect(new URL("/teacher?error=stripe_unavailable", request.url));
        }

        // Verify account status
        const account = await stripe.accounts.retrieve(accountId);

        if (account.details_submitted) {
            // Could update DB here if we had a status column, otherwise just redirect
            // For now, relies on stripe_account_id being present in DB which we did in the POST
            return NextResponse.redirect(new URL("/teacher?payouts_setup=true", request.url));
        } else {
            return NextResponse.redirect(new URL("/teacher?error=incomplete_onboarding", request.url));
        }

    } catch (error) {
        console.error("Stripe Return Error:", error);
        return NextResponse.redirect(new URL("/teacher?error=onboarding_failed", request.url));
    }
}
