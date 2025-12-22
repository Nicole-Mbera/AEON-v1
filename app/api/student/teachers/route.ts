import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const teachers = db.prepare(`
      SELECT 
        t.id,
        t.full_name,
        t.specialization,
        t.bio,
        t.years_of_experience,
        t.phone,
        t.average_rating,
        t.total_reviews,
        u.email
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.is_active = 1 AND u.is_verified = 1
      ORDER BY t.average_rating DESC, t.full_name
    `).all();

    return NextResponse.json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
