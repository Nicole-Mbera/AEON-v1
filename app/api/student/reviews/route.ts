
import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'student')) {
      return NextResponse.json(
        { error: 'Unauthorized. Student access required.' },
        { status: 403 }
      );
    }

    const { teacher_id, rating, comment, consultation_id } = await request.json();

    if (!teacher_id || !rating) {
      return NextResponse.json(
        { error: 'Teacher ID and rating are required' },
        { status: 400 }
      );
    }

    const patientRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const patient = patientRes.rows[0] as unknown as { id: number } | undefined;

    if (!patient) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    // Verify consultation exists and belongs to student/teacher, and is completed?
    // Optional check
    if (consultation_id) {
      const consultationRes = await db.execute({
        sql: `SELECT id FROM sessions WHERE id = ? AND student_id = ? AND teacher_id = ?`,
        args: [consultation_id, patient.id, teacher_id]
      });
      if (consultationRes.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid consultation' }, { status: 400 });
      }
    }

    // Check if review already exists for this consultation (if provided)
    if (consultation_id) {
      const existingRes = await db.execute({
        sql: `SELECT id FROM reviews WHERE consultation_id = ?`,
        args: [consultation_id]
      });
      if (existingRes.rows.length > 0) {
        return NextResponse.json({ error: 'Review already exists for this session' }, { status: 400 });
      }
    }

    await db.execute({
      sql: `INSERT INTO reviews (student_id, teacher_id, consultation_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [patient.id, teacher_id, consultation_id || null, rating, comment || null]
    });

    // Update teacher average rating
    // This is a bit complex in async without triggers, let's do a quick recalc
    const ratingsRes = await db.execute({
      sql: 'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE teacher_id = ?',
      args: [teacher_id]
    });
    const { avg_rating, total } = ratingsRes.rows[0] as any;

    await db.execute({
      sql: `UPDATE teachers SET average_rating = ?, total_reviews = ? WHERE id = ?`,
      args: [avg_rating || 0, total || 0, teacher_id]
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully'
    });

  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
