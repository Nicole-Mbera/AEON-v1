import db from '../lib/db';

async function main() {
    console.log('Creating password_resets table...');

    try {
        await db.execute(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

        console.log('✅ password_resets table created successfully');
    } catch (error) {
        console.error('❌ Failed to create password_resets table:', error);
        process.exit(1);
    }
}

main();
