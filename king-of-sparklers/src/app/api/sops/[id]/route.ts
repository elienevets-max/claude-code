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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;

    const sop = db.prepare('SELECT * FROM sops WHERE id = ?').get(id) as Record<string, unknown> | undefined;

    if (!sop) {
      return NextResponse.json(
        { error: 'SOP not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(parseSop(sop));
  } catch (error) {
    console.error('Error fetching SOP:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOP' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;
    const body = await request.json();

    const existing = db.prepare('SELECT * FROM sops WHERE id = ?').get(id) as Record<string, unknown> | undefined;

    if (!existing) {
      return NextResponse.json(
        { error: 'SOP not found' },
        { status: 404 }
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, string> = {
      title: 'title',
      category: 'category',
      version: 'version',
    };

    for (const [camel, snake] of Object.entries(fieldMap)) {
      if (body[camel] !== undefined) {
        fields.push(`${snake} = ?`);
        values.push(body[camel]);
      }
    }

    if (body.steps !== undefined) {
      fields.push('steps = ?');
      values.push(JSON.stringify(body.steps));
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    fields.push("last_updated = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE sops SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM sops WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseSop(updated));
  } catch (error) {
    console.error('Error updating SOP:', error);
    return NextResponse.json(
      { error: 'Failed to update SOP' },
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

    const existing = db.prepare('SELECT * FROM sops WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'SOP not found' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM sops WHERE id = ?').run(id);

    return NextResponse.json({ message: 'SOP deleted successfully' });
  } catch (error) {
    console.error('Error deleting SOP:', error);
    return NextResponse.json(
      { error: 'Failed to delete SOP' },
      { status: 500 }
    );
  }
}
