import db from '@/lib/db';

export async function getAvailableTeachers() {
    try {
        const teachersRes = await db.execute({
            sql: `SELECT 
        t.id,
        t.full_name,
        t.specialization,
        t.bio,
        t.years_of_experience,
        t.phone,
        t.average_rating,
        t.total_reviews,
        u.email,
        t.profile_picture as profile_image
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.is_active = 1 AND u.is_verified = 1
      ORDER BY t.average_rating DESC, t.full_name
      LIMIT 20`,
            args: []
        });

        return teachersRes.rows;
    } catch (error) {
        console.error('Get teachers error:', error);
        return [];
    }
}
