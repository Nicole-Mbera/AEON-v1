
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'aeon.db');
const db = new Database(dbPath);

console.log('Running migration: Create resource_bookmarks table...');

try {
    db.prepare(`
    CREATE TABLE IF NOT EXISTS resource_bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        resource_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(student_id, resource_type, resource_id)
    )
  `).run();

    console.log('Table resource_bookmarks created successfully.');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
