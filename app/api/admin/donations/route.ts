import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/admin/donations - Get all donations
export async function GET(request: NextRequest) {
  try {
    // Authenticate and check if user is admin
    const user = getUserFromRequest(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = 'SELECT * FROM donations';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Get donations
    const donationsRes = await db.execute({ sql: query, args: params });
    const donations = donationsRes.rows;

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM donations';
    if (status) {
      countQuery += ' WHERE status = ?';
    }
    const countParams = status ? [status] : [];
    const countRes = await db.execute({ sql: countQuery, args: countParams });
    const total = (countRes.rows[0] as any).total;

    // Calculate statistics
    const statsRes = await db.execute({
      sql: `SELECT 
        COUNT(*) as total_donations,
        SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as total_amount,
        AVG(CASE WHEN status = 'succeeded' THEN amount ELSE NULL END) as avg_donation,
        COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_donations,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_donations
      FROM donations`,
      args: []
    });
    const stats = statsRes.rows[0] as any;

    return NextResponse.json({
      donations: donations.map((d: any) => ({
        ...d,
        amount_usd: d.amount / 100, // Convert cents to dollars
        metadata: d.metadata ? JSON.parse(d.metadata) : null,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      stats: {
        total_donations: stats.total_donations,
        total_amount_usd: (stats.total_amount || 0) / 100,
        avg_donation_usd: (stats.avg_donation || 0) / 100,
        successful_donations: stats.successful_donations,
        failed_donations: stats.failed_donations,
      },
    });
  } catch (error: any) {
    console.error('Get donations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get donations' },
      { status: 500 }
    );
  }
}
