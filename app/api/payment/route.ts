// app/api/payment/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/auth";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request);
    const { amount, email, name, type, metadata } = await request.json();

    if (!stripe) {
      console.error("Stripe is not initialized. Missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        { error: "Payment service unavailable" },
        { status: 503 }
      );
    }

    // Validate amount
    if (!amount || amount < 100) { // Minimum $1.00
      return NextResponse.json(
        { error: "Amount must be at least $1.00" },
        { status: 400 }
      );
    }

    // Validate email and name
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Prepare metadata
    const paymentMetadata: Stripe.MetadataParam = {
      donor_name: name,
      email: email,
      platform: "AEON.Academy",
      ...metadata, // Include any passed metadata
    };

    // If request has a specific type (e.g. subscription), use it. 
    // Otherwise default to education_donation if not specified in metadata either.
    if (type) {
      paymentMetadata.type = type;
    } else if (!paymentMetadata.type) {
      paymentMetadata.type = "education_donation"; // Default fallback
    }

    // If user is logged in, attach their ID
    if (user) {
      paymentMetadata.userId = user.userId.toString();
    }

    console.log("Creating PaymentIntent with metadata:", paymentMetadata);

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure integer (amount in cents)
      currency: "usd",
      receipt_email: email,
      metadata: paymentMetadata,
      // Optional: add automatic_payment_methods for better UX
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    });
  } catch (error: any) {
    console.error("PaymentIntent error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}