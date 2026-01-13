import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const results = [];

        // Add subscription_status column
        try {
            await db.execute({
                sql: "ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'inactive'",
                args: [],
            });
            results.push('Added subscription_status column');
        } catch (e: any) {
            if (e.message && (e.message.includes('duplicate column') || e.message.includes('no such column'))) {
                // If it fails, strictly check if column exists first might be safer, but 'duplicate column' is standard error
                results.push(`subscription_status column check: ${e.message}`);
            } else {
                results.push(`Error adding subscription_status: ${e.message}`);
            }
        }

        // Add subscription_end_date column
        try {
            await db.execute({
                sql: "ALTER TABLE users ADD COLUMN subscription_end_date DATETIME",
                args: [],
            });
            results.push('Added subscription_end_date column');
        } catch (e: any) {
            if (e.message && (e.message.includes('duplicate column') || e.message.includes('no such column'))) {
                results.push(`subscription_end_date column check: ${e.message}`);
            } else {
                results.push(`Error adding subscription_end_date: ${e.message}`);
            }
        }

        return NextResponse.json({ success: true, message: 'Schema update attempt completed', details: results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
