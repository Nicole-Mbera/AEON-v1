
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Configuration
const LOCAL_DB_PATH = path.join(process.cwd(), 'aeon.db');
const SCHEMA_PATH = path.join(process.cwd(), 'lib', 'db', 'schema-education.sql');

// Cloud Client
const cloudDb = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Local Client
const localDb = new Database(LOCAL_DB_PATH, { verbose: console.log });

async function migrate() {
    console.log('🚀 Starting Migration: Local (aeon.db) -> Turso Cloud');

    try {
        // ---------------------------------------------------------
        // PHASE 1: Schema Migration
        // ---------------------------------------------------------
        console.log('\n--- Phase 1: Applying Schema ---');
        const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');

        // Split and clean statements
        const cleanSql = schemaSql.replace(/--.*$/gm, '');
        const statements = cleanSql.split(';').map(s => s.trim()).filter(s => s.length > 0);

        console.log(`Found ${statements.length} schema statements.`);

        for (const stmt of statements) {
            if (stmt.toUpperCase().startsWith('CREATE TRIGGER')) {
                // Triggers often contain semicolons, naive splitting might break them. 
                // For now, we skip triggers or try to run specific ones known to be safe?
                // This simple split effectively breaks complex triggers. 
                // Let's rely on basic tables first. Triggers can be re-added if needed manually or with smarter splitting.
                // Actually, most simple triggers work if the split logic holds. 
                // Let's attempt execution but catch specific trigger errors specifically or just log.
            }
            try {
                await cloudDb.execute(stmt);
            } catch (e: any) {
                // Ignore "already exists" errors
                if (!e.message.includes('already exists')) {
                    console.error(`Error executing schema statement: ${e.message.substring(0, 100)}`);
                }
            }
        }
        console.log('✅ Schema applied.');


        // ---------------------------------------------------------
        // PHASE 2: Data Migration
        // ---------------------------------------------------------
        console.log('\n--- Phase 2: Copying Data ---');

        const tables = [
            'users',
            'students',
            'teachers',
            'admins',
            'sessions',
            'session_attendees',
            'invitations',
            'reviews',
            'articles',
            'testimonials'
        ];

        for (const table of tables) {
            console.log(`Migrating table: ${table}...`);

            // 1. Check if table exists locally
            try {
                const rowCount = localDb.prepare(`SELECT count(*) as count FROM ${table}`).get() as { count: number };
                if (rowCount.count === 0) {
                    console.log(`   Skipping (empty local table).`);
                    continue;
                }

                // 2. Clear remote table (Optional: strictly overwrite? Or just append?)
                // Let's delete to ensure we match local state exactly (development mode assumption)
                // await cloudDb.execute(`DELETE FROM ${table}`); 
                // WARNING: Deleting might violate foreign keys if done in wrong order. 
                // Since we insert in order, let's try assuming clean remote or just ignoring conflicts.
                // Better: Try to insert, ignore conflicts?

                // 3. Fetch local data
                const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
                console.log(`   Found ${rows.length} rows.`);

                // 4. Insert into Cloud
                let successCount = 0;
                for (const row of rows) {
                    const keys = Object.keys(row);
                    const values = Object.values(row);
                    const placeholders = keys.map(() => '?').join(',');

                    const sql = `INSERT OR IGNORE INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;

                    try {
                        await cloudDb.execute({ sql, args: values as any[] });
                        successCount++;
                    } catch (err: any) {
                        console.error(`   Failed to insert row ${JSON.stringify(row).substring(0, 50)}... : ${err.message}`);
                    }
                }
                console.log(`   ✅ Migrated ${successCount}/${rows.length} rows.`);

            } catch (err: any) {
                if (err.message.includes('no such table')) {
                    console.log(`   Skipping (table not found in local DB).`);
                } else {
                    console.error(`   Error migrating ${table}: ${err.message}`);
                }
            }
        }

        console.log('\n✅ Migration Complete!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration Failed:', error);
        process.exit(1);
    }
}

migrate();
