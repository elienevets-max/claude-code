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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;
    const body = await request.json();

    const existing = db.prepare('SELECT * FROM journey_customers WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Journey customer not found' },
        { status: 404 }
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, string> = {
      name: 'name',
      email: 'email',
      company: 'company',
      stage: 'stage',
      notes: 'notes',
      lastAction: 'last_action',
    };

    for (const [camel, snake] of Object.entries(fieldMap)) {
      if (body[camel] !== undefined) {
        fields.push(`${snake} = ?`);
        values.push(body[camel]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    db.prepare(`UPDATE journey_customers SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM journey_customers WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseJourneyCustomer(updated));
  } catch (error) {
    console.error('Error updating journey customer:', error);
    return NextResponse.json(
      { error: 'Failed to update journey customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;

    const existing = db.prepare('SELECT * FROM journey_customers WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Journey customer not found' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM journey_customers WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Journey customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting journey customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete journey customer' },
      { status: 500 }
    );
  }
}
