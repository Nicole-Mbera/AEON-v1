import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import db from '@/lib/db';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      case 'invoice.payment_succeeded':
        // Handle subscription payment success if needed
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await handleSubscriptionPayment(invoice);
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler failed:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { metadata, amount, currency, id } = paymentIntent;

  if (!metadata) return;

  const { userId, type, session_id } = metadata;

  // Record transaction in database
  await db.execute({
    sql: `
      INSERT INTO transactions (
        stripe_payment_id,
        user_id,
        amount,
        currency,
        status,
        type,
        metadata
      ) VALUES (?, ?, ?, ?, 'succeeded', ?, ?)
    `,
    args: [
      id,
      userId || null,
      amount,
      currency,
      type || 'one_time',
      JSON.stringify(metadata)
    ]
  });

  // If this was a donation
  if (type === 'donation') {
    await db.execute({
      sql: `
        INSERT INTO donations (
          user_id,
          amount,
          currency,
          status,
          stripe_payment_id,
          metadata
        ) VALUES (?, ?, ?, 'succeeded', ?, ?)
      `,
      args: [
        userId || null,
        amount,
        currency,
        id,
        JSON.stringify(metadata)
      ]
    });
  }

  // If this was a session booking payment
  if (type === 'session_booking' && session_id) {
    await db.execute({
      sql: `UPDATE sessions SET status = 'confirmed', payment_status = 'paid' WHERE id = ?`,
      args: [session_id]
    });
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { metadata, amount, currency, id, last_payment_error } = paymentIntent;

  await db.execute({
    sql: `
      INSERT INTO transactions (
        stripe_payment_id,
        user_id,
        amount,
        currency,
        status,
        type,
        metadata,
        error_message
      ) VALUES (?, ?, ?, ?, 'failed', ?, ?, ?)
    `,
    args: [
      id,
      metadata?.userId || null,
      amount,
      currency,
      metadata?.type || 'unknown',
      JSON.stringify(metadata),
      last_payment_error?.message || 'Unknown error'
    ]
  });

  // If this was a donation
  if (metadata?.type === 'donation') {
    await db.execute({
      sql: `
        INSERT INTO donations (
          user_id,
          amount,
          currency,
          status,
          stripe_payment_id,
          metadata
        ) VALUES (?, ?, ?, 'failed', ?, ?)
      `,
      args: [
        metadata.userId || null,
        amount,
        currency,
        id,
        JSON.stringify(metadata)
      ]
    });
  }
}

async function handleSubscriptionPayment(invoice: Stripe.Invoice) {
  // Logic to update user subscription status
  if (invoice.customer_email) {
    console.log(`Subscription payment received for ${invoice.customer_email}`);
    // Here you would look up the user by email and update their subscription status
    // For example:
    // db.execute('UPDATE users SET subscription_status = "active" WHERE email = ?', [invoice.customer_email]);
  }
}
