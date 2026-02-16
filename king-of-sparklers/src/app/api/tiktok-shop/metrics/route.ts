import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseMetric(row: Record<string, unknown>) {
  return {
    id: row.id,
    date: row.date,
    period: row.period,
    totalGmv: row.total_gmv,
    totalOrders: row.total_orders,
    totalViews: row.total_views,
    totalVideosPosted: row.total_videos_posted,
    commissionEarned: row.commission_earned,
    topProduct: row.top_product,
    notes: row.notes,
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');

    let query = 'SELECT * FROM tiktok_shop_metrics';
    const params: string[] = [];

    if (period) {
      query += ' WHERE period = ?';
      params.push(period);
    }
    query += ' ORDER BY date DESC';

    const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
    return NextResponse.json(rows.map(parseMetric));
  } catch (error) {
    console.error('Error fetching TikTok Shop metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO tiktok_shop_metrics (id, date, period, total_gmv, total_orders, total_views, total_videos_posted, commission_earned, top_product, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.date || '',
      body.period || 'daily',
      body.totalGmv || 0,
      body.totalOrders || 0,
      body.totalViews || 0,
      body.totalVideosPosted || 0,
      body.commissionEarned || 0,
      body.topProduct || '',
      body.notes || ''
    );

    const row = db.prepare('SELECT * FROM tiktok_shop_metrics WHERE id = ?').get(id) as Record<string, unknown>;
    return NextResponse.json(parseMetric(row), { status: 201 });
  } catch (error) {
    console.error('Error creating TikTok Shop metric:', error);
    return NextResponse.json({ error: 'Failed to create metric' }, { status: 500 });
  }
}
