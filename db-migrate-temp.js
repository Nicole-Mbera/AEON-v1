
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'aeon.db');
const db = new Database(dbPath);

console.log('Running migration on:', dbPath);

try {
    // Session Attendees (for group sessions)
    db.prepare(`
    CREATE TABLE IF NOT EXISTS session_attendees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        invitation_status TEXT DEFAULT 'pending' CHECK(invitation_status IN ('pending', 'accepted', 'declined')),
        invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(session_id, student_id)
    )
  `).run();
    console.log('Verified/Created session_attendees table');

    // Invitations (Student to Student)
    db.prepare(`
    CREATE TABLE IF NOT EXISTS invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_student_id INTEGER NOT NULL,
        recipient_student_id INTEGER NOT NULL,
        teacher_id INTEGER NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined')),
        session_id INTEGER, -- Populated if accepted and booked
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        responded_at DATETIME,
        FOREIGN KEY (sender_student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
    )
  `).run();
    console.log('Verified/Created invitations table');

} catch (err) {
    console.error('Migration failed:', err);
}
