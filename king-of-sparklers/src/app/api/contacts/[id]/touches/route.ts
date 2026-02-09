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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;
    const body = await request.json();

    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as Record<string, unknown> | undefined;

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const existingTouches = contact.touches
      ? JSON.parse(contact.touches as string)
      : [];

    const newTouch = {
      id: crypto.randomUUID(),
      date: body.date || new Date().toISOString(),
      type: body.type || 'note',
      notes: body.notes || '',
      ...body,
    };

    existingTouches.push(newTouch);

    db.prepare(`
      UPDATE contacts SET touches = ?, updated_at = datetime('now') WHERE id = ?
    `).run(JSON.stringify(existingTouches), id);

    const updated = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseContact(updated), { status: 201 });
  } catch (error) {
    console.error('Error adding touch:', error);
    return NextResponse.json(
      { error: 'Failed to add touch' },
      { status: 500 }
    );
  }
}
