import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseVideo(row: Record<string, unknown>) {
  return {
    id: row.id,
    productId: row.product_id,
    title: row.title,
    hook: row.hook,
    format: row.format,
    status: row.status,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    ordersGenerated: row.orders_generated,
    gmvGenerated: row.gmv_generated,
    postedDate: row.posted_date,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    const format = searchParams.get('format');

    let query = 'SELECT * FROM tiktok_shop_videos';
    const conditions: string[] = [];
    const params: string[] = [];

    if (productId) {
      conditions.push('product_id = ?');
      params.push(productId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (format) {
      conditions.push('format = ?');
      params.push(format);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
    return NextResponse.json(rows.map(parseVideo));
  } catch (error) {
    console.error('Error fetching TikTok Shop videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO tiktok_shop_videos (id, product_id, title, hook, format, status, views, likes, comments, shares, orders_generated, gmv_generated, posted_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.productId || '',
      body.title || '',
      body.hook || '',
      body.format || 'showcase',
      body.status || 'idea',
      body.views || 0,
      body.likes || 0,
      body.comments || 0,
      body.shares || 0,
      body.ordersGenerated || 0,
      body.gmvGenerated || 0,
      body.postedDate || '',
      body.notes || ''
    );

    const row = db.prepare('SELECT * FROM tiktok_shop_videos WHERE id = ?').get(id) as Record<string, unknown>;
    return NextResponse.json(parseVideo(row), { status: 201 });
  } catch (error) {
    console.error('Error creating TikTok Shop video:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
