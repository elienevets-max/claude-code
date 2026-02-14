import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseRock(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    quarter: row.quarter,
    year: row.year,
    progress: row.progress,
    status: row.status,
    owner: row.owner,
    dueDate: row.due_date,
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const quarter = searchParams.get('quarter');
    const year = searchParams.get('year');

    let query = 'SELECT * FROM rocks';
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (quarter) {
      conditions.push('quarter = ?');
      params.push(quarter);
    }

    if (year) {
      conditions.push('year = ?');
      params.push(parseInt(year, 10));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const rocks = db.prepare(query).all(...params) as Record<string, unknown>[];

    return NextResponse.json(rocks.map(parseRock));
  } catch (error) {
    console.error('Error fetching rocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rocks' },
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
      INSERT INTO rocks (id, title, description, quarter, year, progress, status, owner, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      body.title || '',
      body.description || '',
      body.quarter || 'Q1',
      body.year || new Date().getFullYear(),
      body.progress ?? 0,
      body.status || 'on_track',
      body.owner || '',
      body.dueDate || ''
    );

    const rock = db.prepare('SELECT * FROM rocks WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseRock(rock), { status: 201 });
  } catch (error) {
    console.error('Error creating rock:', error);
    return NextResponse.json(
      { error: 'Failed to create rock' },
      { status: 500 }
    );
  }
}
