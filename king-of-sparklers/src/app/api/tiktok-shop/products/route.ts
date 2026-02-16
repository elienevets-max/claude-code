import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseProduct(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    price: row.price,
    commissionRate: row.commission_rate,
    status: row.status,
    sampleStatus: row.sample_status,
    tiktokUrl: row.tiktok_url,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM tiktok_shop_products';
    const conditions: string[] = [];
    const params: string[] = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
    return NextResponse.json(rows.map(parseProduct));
  } catch (error) {
    console.error('Error fetching TikTok Shop products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO tiktok_shop_products (id, name, sku, category, price, commission_rate, status, sample_status, tiktok_url, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.name || '',
      body.sku || '',
      body.category || 'starter',
      body.price || 0,
      body.commissionRate || 0,
      body.status || 'draft',
      body.sampleStatus || 'none',
      body.tiktokUrl || '',
      body.notes || ''
    );

    const row = db.prepare('SELECT * FROM tiktok_shop_products WHERE id = ?').get(id) as Record<string, unknown>;
    return NextResponse.json(parseProduct(row), { status: 201 });
  } catch (error) {
    console.error('Error creating TikTok Shop product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
