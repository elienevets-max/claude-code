import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseSop(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    steps: row.steps ? JSON.parse(row.steps as string) : [],
    version: row.version,
    lastUpdated: row.last_updated,
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = 'SELECT * FROM sops';
    const params: string[] = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    const sops = db.prepare(query).all(...params) as Record<string, unknown>[];

    return NextResponse.json(sops.map(parseSop));
  } catch (error) {
    console.error('Error fetching SOPs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOPs' },
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
      INSERT INTO sops (id, title, category, steps, version, last_updated)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      id,
      body.title || '',
      body.category || 'general',
      body.steps ? JSON.stringify(body.steps) : '[]',
      body.version || '1.0'
    );

    const sop = db.prepare('SELECT * FROM sops WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseSop(sop), { status: 201 });
  } catch (error) {
    console.error('Error creating SOP:', error);
    return NextResponse.json(
      { error: 'Failed to create SOP' },
      { status: 500 }
    );
  }
}
