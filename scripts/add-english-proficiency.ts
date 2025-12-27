import db from '../lib/db/index.js';

console.log('Migrating database: Adding English proficiency fields to students table...');

try {
    // Check if columns already exist to avoid errors
    const tableInfo = db.prepare('PRAGMA table_info(students)').all() as any[];
    const hasProficiency = tableInfo.some(col => col.name === 'english_proficiency');
    const hasCertificate = tableInfo.some(col => col.name === 'proficiency_certificate');

    if (!hasProficiency) {
        db.prepare(`
      ALTER TABLE students 
      ADD COLUMN english_proficiency TEXT CHECK(english_proficiency IN ('beginner', 'intermediate', 'advanced'))
    `).run();
        console.log('Added english_proficiency column.');
    } else {
        console.log('english_proficiency column already exists.');
    }

    if (!hasCertificate) {
        db.prepare(`
      ALTER TABLE students 
      ADD COLUMN proficiency_certificate TEXT
    `).run();
        console.log('Added proficiency_certificate column.');
    }

    console.log('Migration complete!');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
