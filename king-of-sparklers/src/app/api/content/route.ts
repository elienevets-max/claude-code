import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseContentItem(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    pillar: row.pillar,
    platform: row.platform,
    audience: row.audience,
    status: row.status,
    scheduledDate: row.scheduled_date,
    brief: row.brief,
    createdAt: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const pillar = searchParams.get('pillar');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM content_items';
    const conditions: string[] = [];
    const params: string[] = [];

    if (pillar) {
      conditions.push('pillar = ?');
      params.push(pillar);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const items = db.prepare(query).all(...params) as Record<string, unknown>[];

    return NextResponse.json(items.map(parseContentItem));
  } catch (error) {
    console.error('Error fetching content items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const id = crypto.randomUUID();

    const stmt = db.prepare(`
      INSERT INTO content_items (id, title, pillar, platform, audience, status, scheduled_date, brief, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      id,
      body.title || '',
      body.pillar || 'safety',
      body.platform || '',
      body.audience || '',
      body.status || 'idea',
      body.scheduledDate || '',
      body.brief || ''
    );

    const item = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseContentItem(item), { status: 201 });
  } catch (error) {
    console.error('Error creating content item:', error);
    return NextResponse.json(
      { error: 'Failed to create content item' },
      { status: 500 }
    );
  }
}
