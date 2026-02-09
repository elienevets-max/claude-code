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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;
    const body = await request.json();

    const existing = db.prepare('SELECT * FROM rocks WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Rock not found' },
        { status: 404 }
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, string> = {
      title: 'title',
      description: 'description',
      quarter: 'quarter',
      year: 'year',
      progress: 'progress',
      status: 'status',
      owner: 'owner',
      dueDate: 'due_date',
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

    const stmt = db.prepare(`UPDATE rocks SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    const updated = db.prepare('SELECT * FROM rocks WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseRock(updated));
  } catch (error) {
    console.error('Error updating rock:', error);
    return NextResponse.json(
      { error: 'Failed to update rock' },
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

    const existing = db.prepare('SELECT * FROM rocks WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Rock not found' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM rocks WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Rock deleted successfully' });
  } catch (error) {
    console.error('Error deleting rock:', error);
    return NextResponse.json(
      { error: 'Failed to delete rock' },
      { status: 500 }
    );
  }
}
