
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'aeon.db');
const db = new Database(dbPath);

console.log('Running migration: Add password reset columns to users table...');

try {
    // Check if columns already exist to avoid errors
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const hasTokenColumn = tableInfo.some(col => col.name === 'reset_password_token');
    const hasExpiresColumn = tableInfo.some(col => col.name === 'reset_password_expires');

    if (!hasTokenColumn) {
        db.prepare("ALTER TABLE users ADD COLUMN reset_password_token TEXT").run();
        console.log('Added reset_password_token column.');
    } else {
        console.log('reset_password_token column already exists.');
    }

    if (!hasExpiresColumn) {
        db.prepare("ALTER TABLE users ADD COLUMN reset_password_expires DATETIME").run();
        console.log('Added reset_password_expires column.');
    } else {
        console.log('reset_password_expires column already exists.');
    }

    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
