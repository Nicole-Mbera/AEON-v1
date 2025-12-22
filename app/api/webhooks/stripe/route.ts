import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import Database from 'better-sqlite3';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize database connection
const dbPath = path.join(process.cwd(), 'aeon.db');
const db = new Database(dbPath);

// Ensure donations table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending',
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(donor_email);
  CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
  CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
`);

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!webhookSecret) {
    console.warn('⚠️ STRIPE_WEBHOOK_SECRET not set - webhook verification disabled');
    // In development, you can proceed without verification
    // In production, this should return an error
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }
  }

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For development without webhook secret, parse the body directly
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ Payment succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          donor: paymentIntent.metadata.donor_name,
          email: paymentIntent.metadata.email,
        });
        
        // Save donation to database
        try {
          const stmt = db.prepare(`
            INSERT INTO donations (
              stripe_payment_intent_id,
              donor_name,
              donor_email,
              amount,
              currency,
              status,
              metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(stripe_payment_intent_id) DO UPDATE SET
              status = excluded.status,
              updated_at = CURRENT_TIMESTAMP
          `);
          
          stmt.run(
            paymentIntent.id,
            paymentIntent.metadata.donor_name || 'Anonymous',
            paymentIntent.metadata.email || paymentIntent.receipt_email || '',
            paymentIntent.amount,
            paymentIntent.currency,
            'succeeded',
            JSON.stringify(paymentIntent.metadata)
          );
          
          console.log('✅ Donation saved to database');
        } catch (dbError: any) {
          console.error('Error saving donation to database:', dbError);
        }
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('❌ Payment failed:', {
          id: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message,
        });
        
        // Update donation status in database
        try {
          const stmt = db.prepare(`
            INSERT INTO donations (
              stripe_payment_intent_id,
              donor_name,
              donor_email,
              amount,
              currency,
              status,
              metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(stripe_payment_intent_id) DO UPDATE SET
              status = excluded.status,
              updated_at = CURRENT_TIMESTAMP
          `);
          
          stmt.run(
            paymentIntent.id,
            paymentIntent.metadata.donor_name || 'Anonymous',
            paymentIntent.metadata.email || paymentIntent.receipt_email || '',
            paymentIntent.amount,
            paymentIntent.currency,
            'failed',
            JSON.stringify(paymentIntent.metadata)
          );
        } catch (dbError: any) {
          console.error('Error updating failed payment in database:', dbError);
        }
        
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('⚠️ Payment canceled:', paymentIntent.id);
        
        // Update donation status in database
        try {
          const stmt = db.prepare(`
            UPDATE donations 
            SET status = 'canceled', updated_at = CURRENT_TIMESTAMP
            WHERE stripe_payment_intent_id = ?
          `);
          
          stmt.run(paymentIntent.id);
        } catch (dbError: any) {
          console.error('Error updating canceled payment in database:', dbError);
        }
        
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
