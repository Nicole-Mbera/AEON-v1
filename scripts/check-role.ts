
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'aeon.db');
const db = new Database(dbPath);

const email = 'mberanicole@gmail.com';
const user = db.prepare('SELECT email, role FROM users WHERE email = ?').get(email);

if (user) {
    console.log('User found:', user);
} else {
    console.log('User NOT found:', email);
}
