
import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'aeon.db');
const db = new Database(dbPath);

console.log('Migrating database: Adding missing teacher fields...');

const columnsToAdd = [
    { name: 'license_number', type: 'TEXT' },
    { name: 'institution_name', type: 'TEXT' },
    { name: 'country', type: 'TEXT' },
    { name: 'contact_email', type: 'TEXT' },
    { name: 'mission', type: 'TEXT' },
    { name: 'documents', type: 'TEXT' }
];

try {
    // Get existing columns
    const tableInfo = db.pragma('table_info(teachers)') as { name: string }[];
    const existingColumns = new Set(tableInfo.map(col => col.name));

    for (const col of columnsToAdd) {
        if (!existingColumns.has(col.name)) {
            console.log(`Adding column: ${col.name}`);
            db.prepare(`ALTER TABLE teachers ADD COLUMN ${col.name} ${col.type}`).run();
        } else {
            console.log(`Column ${col.name} already exists.`);
        }
    }

    console.log('Migration complete!');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
