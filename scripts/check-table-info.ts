
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'aeon.db');
const db = new Database(dbPath);

const tableInfo = db.prepare("PRAGMA table_info(testimonials)").all();
console.log('Testimonials table columns:', tableInfo);
