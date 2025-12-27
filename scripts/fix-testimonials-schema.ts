
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'aeon.db');
const db = new Database(dbPath);

console.log('Running migration: Fix testimonials schema...');

try {
    const tableInfo = db.prepare("PRAGMA table_info(testimonials)").all() as any[];
    const hasStatusColumn = tableInfo.some(col => col.name === 'approval_status');

    if (!hasStatusColumn) {
        db.prepare("ALTER TABLE testimonials ADD COLUMN approval_status TEXT DEFAULT 'pending'").run();
        console.log('Added approval_status column.');

        // Migrate existing is_approved data if it exists
        const hasIsApproved = tableInfo.some(col => col.name === 'is_approved');
        if (hasIsApproved) {
            db.prepare("UPDATE testimonials SET approval_status = 'approved' WHERE is_approved = 1").run();
            console.log('Migrated is_approved data.');
        }
    } else {
        console.log('approval_status column already exists.');
    }

    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
