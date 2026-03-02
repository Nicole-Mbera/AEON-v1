
import client from '../lib/db/index';

async function migrate() {
    console.log('Starting migration...');

    try {
        // Add columns to teachers table
        // consultation_fee has been removed from the schema. If you rerun this
        // migration after running `scripts/drop-consultation-fee.ts` it would
        // otherwise re‑create the column, so we no longer include it here.
        try {
            await client.execute('ALTER TABLE teachers ADD COLUMN stripe_account_id TEXT');
            console.log('Added stripe_account_id to teachers');
        } catch (e: any) {
            if (!e.message.includes('duplicate column')) console.log('stripe_account_id might already exist or error:', e.message);
        }

        // Add columns to sessions table
        try {
            await client.execute("ALTER TABLE sessions ADD COLUMN payment_status TEXT DEFAULT 'unpaid'");
            console.log('Added payment_status to sessions');
        } catch (e: any) {
            if (!e.message.includes('duplicate column')) console.log('payment_status might already exist or error:', e.message);
        }

        try {
            await client.execute('ALTER TABLE sessions ADD COLUMN payment_intent_id TEXT');
            console.log('Added payment_intent_id to sessions');
        } catch (e: any) {
            if (!e.message.includes('duplicate column')) console.log('payment_intent_id might already exist or error:', e.message);
        }

        try {
            await client.execute('ALTER TABLE sessions ADD COLUMN amount_paid INTEGER DEFAULT 0');
            console.log('Added amount_paid to sessions');
        } catch (e: any) {
            if (!e.message.includes('duplicate column')) console.log('amount_paid might already exist or error:', e.message);
        }

        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
