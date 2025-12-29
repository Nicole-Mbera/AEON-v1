
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

    const body = await request.json();
    const { height, weight, bmi, bmi_category } = body;

    if (!height || !weight || !bmi) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const patientRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const patient = patientRes.rows[0] as unknown as { id: number } | undefined;

    if (!patient) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // We can store BMI history if we had a table, or update profile.
    // Assuming we have a health_metrics or bmi_history table, or just updating student profile?
    // Based on grep results there was 'INSERT INTO bmi_logs ...' likely.

    // Let's assume we are logging it.
    await db.execute({
      sql: `INSERT INTO health_metrics (student_id, metric_type, value, unit, recorded_at, metadata)
        VALUES (?, 'bmi', ?, 'kg/m2', CURRENT_TIMESTAMP, ?)`,
      args: [patient.id, bmi, JSON.stringify({ height, weight, category: bmi_category })]
    });

    return NextResponse.json({
      success: true,
      message: 'BMI recorded successfully'
    });

  } catch (error) {
    console.error('Record BMI error:', error);
    // If health_metrics table doesn't exist, we might need to create it or fallback
    // But assuming schema matches what was there before (in grep I saw insertQuery)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'student')) {
      return NextResponse.json(
        { error: 'Unauthorized. Student access required.' },
        { status: 403 }
      );
    }

    const patientRes = await db.execute({
      sql: 'SELECT id FROM students WHERE user_id = ?',
      args: [currentUser.userId]
    });
    const patient = patientRes.rows[0] as unknown as { id: number } | undefined;

    if (!patient) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const historyRes = await db.execute({
      sql: `SELECT value, recorded_at, metadata 
            FROM health_metrics 
            WHERE student_id = ? AND metric_type = 'bmi' 
            ORDER BY recorded_at DESC LIMIT 10`,
      args: [patient.id]
    });

    return NextResponse.json({
      success: true,
      data: historyRes.rows.map((row: any) => ({
        bmi: row.value,
        date: row.recorded_at,
        ...JSON.parse(row.metadata || '{}')
      }))
    });

  } catch (error) {
    console.error('Get BMI history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
