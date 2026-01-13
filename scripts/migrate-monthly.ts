
import client from '../lib/db/index';

async function migrate() {
    console.log('Starting migration for monthly recurring...');

    try {
        // Add monthly_fee column to teachers table
        try {
            await client.execute('ALTER TABLE teachers ADD COLUMN monthly_fee INTEGER DEFAULT 20000');
            console.log('Added monthly_fee to teachers');
        } catch (e: any) {
            if (!e.message.includes('duplicate column')) console.log('monthly_fee might already exist or error:', e.message);
        }

        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
