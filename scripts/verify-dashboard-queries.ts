
import db from '../lib/db';

async function verifyDashboardQueries() {
    console.log('Verifying dashboard queries against current schema...');

    // 1. Check Upcoming Appointments Query
    console.log('\n1. Checking Upcoming Appointments Query...');
    try {
        const stmt = db.prepare(`
      SELECT 
  c.id,
  c.scheduled_date,
  c.scheduled_time,
  c.duration_minutes,
  c.meeting_link,
  c.status,
  c.notes,
  hp.full_name AS doctor_name,
  hp.specialization,
  hp.profile_picture AS doctor_picture
FROM sessions c
JOIN teachers hp ON c.teacher_id = hp.id
WHERE c.status IN ('scheduled', 'confirmed')
LIMIT 1;
    `);
        stmt.get(); // Run the query
        console.log('✅ Upcoming Appointments Query OK');
    } catch (error: any) {
        console.log('❌ Upcoming Appointments Query Failed:', error.message);
    }

    // 2. Check Articles Query
    console.log('\n2. Checking Articles Query...');
    try {
        const stmt = db.prepare(`
      SELECT 
        a.id,
        a.title,
        a.content
        a.author_type AS category,
        a.thumbnail_url,
        a.views_count,
        a.created_at,
        CASE 
          WHEN a.author_type = 'teacher' THEN hp.full_name
          WHEN a.author_type = 'admin' THEN ia.full_name
        END as author_name,
        CASE 
          WHEN a.author_type = 'teacher' THEN hp.specialization
          ELSE NULL
        END as author_specialization
      FROM articles a
      LEFT JOIN teachers hp ON a.author_type = 'teacher' AND a.author_id = hp.id
      LEFT JOIN admins ia ON a.author_type = 'admin' AND a.author_id = ia.id
      WHERE a.is_published = 1
      LIMIT 1
    `);
        stmt.get();
        console.log('✅ Articles Query OK');
    } catch (error: any) {
        console.log('❌ Articles Query Failed:', error.message);
    }

    // 3. Pending Invitations (Removed, so we skip checking it or check that it's just an empty array logic in app, but here we test DB queries. No DB query for pending invitations anymore.)
    console.log('\n3. Pending Invitations Query (Removed)...');
    console.log('✅ Pending Invitations Logic OK (No query to run)');
}

verifyDashboardQueries().catch(console.error);
