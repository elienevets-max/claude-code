import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseJourneyCustomer(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    stage: row.stage,
    notes: row.notes,
    lastAction: row.last_action,
    createdAt: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');

    let query = 'SELECT * FROM journey_customers';
    const params: string[] = [];

    if (stage) {
      query += ' WHERE stage = ?';
      params.push(stage);
    }

    const customers = db.prepare(query).all(...params) as Record<string, unknown>[];

    return NextResponse.json(customers.map(parseJourneyCustomer));
  } catch (error) {
    console.error('Error fetching journey customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journey customers' },
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
      INSERT INTO journey_customers (id, name, email, company, stage, notes, last_action, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      id,
      body.name || '',
      body.email || '',
      body.company || '',
      body.stage || 'aware',
      body.notes || '',
      body.lastAction || ''
    );

    const customer = db.prepare('SELECT * FROM journey_customers WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseJourneyCustomer(customer), { status: 201 });
  } catch (error) {
    console.error('Error creating journey customer:', error);
    return NextResponse.json(
      { error: 'Failed to create journey customer' },
      { status: 500 }
    );
  }
}
