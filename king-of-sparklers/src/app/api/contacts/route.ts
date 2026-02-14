import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseContact(row: Record<string, unknown>) {
  return {
    id: row.id,
    company: row.company,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    linkedin: row.linkedin,
    category: row.category,
    status: row.status,
    touches: row.touches ? JSON.parse(row.touches as string) : [],
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM contacts';
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
    return NextResponse.json(rows.map(parseContact));
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO contacts (id, company, contact_name, email, phone, linkedin, category, status, touches, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.company || '',
      body.contactName || '',
      body.email || '',
      body.phone || '',
      body.linkedin || '',
      body.category || 'event',
      body.status || 'prospect',
      JSON.stringify(body.touches || []),
      body.notes || ''
    );

    const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as Record<string, unknown>;
    return NextResponse.json(parseContact(row), { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
