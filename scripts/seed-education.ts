import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '..', 'aeon.db'));

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Hash passwords
    const studentPassword = await bcrypt.hash('student123', 10);
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // ============== USERS ==============
    console.log('Creating users...');

    // Admin user
    const adminUser = db.prepare(`
      INSERT INTO users (email, password_hash, role, is_verified, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run('a.niyonseng@alustudent.com', adminPassword, 'admin', 1, 1);

    // Teacher user (verified)
    const teacherUser = db.prepare(`
      INSERT INTO users (email, password_hash, role, is_verified, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run('albertniyon@gmail.com', teacherPassword, 'teacher', 1, 1);

    // Student user
    const studentUser = db.prepare(`
      INSERT INTO users (email, password_hash, role, is_verified, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run('n.umurerwa@alustudent.com', studentPassword, 'student', 1, 1);

    console.log(`✓ Created ${3} users`);

    // ============== ADMINS ==============
    console.log('Creating admins...');

    db.prepare(`
      INSERT INTO admins (user_id, full_name, phone)
      VALUES (?, ?, ?)
    `).run(adminUser.lastInsertRowid, 'System Administrator', '+250788000000');

    console.log(`✓ Created 1 admin`);

    // ============== TEACHERS ==============
    console.log('Creating teachers...');

    const teacherId = db.prepare(`
      INSERT INTO teachers (user_id, full_name, bio, specialization, years_of_experience, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      teacherUser.lastInsertRowid,
      'Dr. Sarah Johnson',
      'Experienced mathematics teacher specializing in algebra and calculus. Passionate about making complex concepts accessible to all students.',
      'Mathematics',
      8,
      '+250788123456'
    ).lastInsertRowid;

    console.log(`✓ Created 1 teacher`);

    // ============== STUDENTS ==============
    console.log('Creating students...');

    const studentId = db.prepare(`
      INSERT INTO students (user_id, username, full_name, date_of_birth, grade_level, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      studentUser.lastInsertRowid,
      'john_doe',
      'John Doe',
      '2008-05-15',
      '10th Grade',
      '+250788999888'
    ).lastInsertRowid;

    console.log(`✓ Created 1 student`);

    // ============== AVAILABILITY SCHEDULES ==============
    console.log('Creating teacher availability...');

    const availabilityInsert = db.prepare(`
      INSERT INTO availability_schedules (teacher_id, day_of_week, start_time, end_time)
      VALUES (?, ?, ?, ?)
    `);

    // Monday to Friday, 9 AM - 5 PM
    for (let day = 1; day <= 5; day++) {
      availabilityInsert.run(teacherId, day, '09:00', '12:00');
      availabilityInsert.run(teacherId, day, '14:00', '17:00');
    }

    console.log(`✓ Created availability schedules`);

    // ============== SESSIONS ==============
    console.log('Creating sample sessions...');

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    db.prepare(`
      INSERT INTO sessions (student_id, teacher_id, scheduled_date, scheduled_time, duration_minutes, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      studentId,
      teacherId,
      tomorrow.toISOString().split('T')[0],
      '10:00',
      60,
      'scheduled',
      'Algebra review session'
    );

    db.prepare(`
      INSERT INTO sessions (student_id, teacher_id, scheduled_date, scheduled_time, duration_minutes, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      studentId,
      teacherId,
      nextWeek.toISOString().split('T')[0],
      '14:30',
      60,
      'scheduled',
      'Calculus introduction'
    );

    console.log(`✓ Created 2 sessions`);

    // ============== TESTIMONIALS ==============
    console.log('Creating testimonials...');

    db.prepare(`
      INSERT INTO testimonials (user_id, user_type, content, rating, is_featured, is_approved)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      studentUser.lastInsertRowid,
      'student',
      'AEON has transformed my learning experience! The personalized sessions with my teacher have helped me improve my grades significantly.',
      5,
      1,
      1
    );

    db.prepare(`
      INSERT INTO testimonials (user_id, user_type, content, rating, is_featured, is_approved)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      teacherUser.lastInsertRowid,
      'teacher',
      'As an educator, AEON provides the perfect platform to connect with students and deliver quality education. The scheduling system is intuitive and efficient.',
      5,
      1,
      1
    );

    console.log(`✓ Created 2 testimonials`);

    // ============== ARTICLES ==============
    console.log('Creating blog articles...');

    db.prepare(`
      INSERT INTO articles (title, content, author_type, author_id, is_published)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'Effective Study Techniques for Mathematics',
      'Mathematics can be challenging, but with the right study techniques, anyone can excel. Here are some proven methods...',
      'teacher',
      teacherId,
      1
    );

    db.prepare(`
      INSERT INTO articles (title, content, author_type, author_id, is_published)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'Welcome to AEON.Academy Platform',
      'We are excited to introduce AEON, your personalized learning companion. Our platform connects students with experienced teachers...',
      'admin',
      adminUser.lastInsertRowid,
      1
    );

    console.log(`✓ Created 2 articles`);

    // ============== ACTIVITY LOGS ==============
    console.log('Creating activity logs...');

    const activities = [
      { userId: adminUser.lastInsertRowid, type: 'login', details: { timestamp: new Date().toISOString() } },
      { userId: teacherUser.lastInsertRowid, type: 'login', details: { timestamp: new Date().toISOString() } },
      { userId: studentUser.lastInsertRowid, type: 'login', details: { timestamp: new Date().toISOString() } },
    ];

    const activityInsert = db.prepare(`
      INSERT INTO user_activity (user_id, activity_type, details)
      VALUES (?, ?, ?)
    `);

    activities.forEach(activity => {
      activityInsert.run(activity.userId, activity.type, JSON.stringify(activity.details));
    });

    console.log(`✓ Created activity logs`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin:   a.niyonseng@alustudent.com / admin123');
    console.log('   Teacher: albertniyon@gmail.com / teacher123');
    console.log('   Student: n.umurerwa@alustudent.com / student123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    db.close();
  }
}

seed();
