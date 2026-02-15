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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;
    const body = await request.json();

    const existing = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Content item not found' },
        { status: 404 }
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, string> = {
      title: 'title',
      pillar: 'pillar',
      platform: 'platform',
      audience: 'audience',
      status: 'status',
      scheduledDate: 'scheduled_date',
      brief: 'brief',
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

    db.prepare(`UPDATE content_items SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseContentItem(updated));
  } catch (error) {
    console.error('Error updating content item:', error);
    return NextResponse.json(
      { error: 'Failed to update content item' },
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

    const existing = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Content item not found' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM content_items WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Content item deleted successfully' });
  } catch (error) {
    console.error('Error deleting content item:', error);
    return NextResponse.json(
      { error: 'Failed to delete content item' },
      { status: 500 }
    );
  }
}
