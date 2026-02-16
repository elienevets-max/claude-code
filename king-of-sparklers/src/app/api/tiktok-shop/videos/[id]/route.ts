import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseVideo(row: Record<string, unknown>) {
  return {
    id: row.id,
    productId: row.product_id,
    title: row.title,
    hook: row.hook,
    format: row.format,
    status: row.status,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    ordersGenerated: row.orders_generated,
    gmvGenerated: row.gmv_generated,
    postedDate: row.posted_date,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;
    const row = db.prepare('SELECT * FROM tiktok_shop_videos WHERE id = ?').get(id) as Record<string, unknown> | undefined;

    if (!row) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(parseVideo(row));
  } catch (error) {
    console.error('Error fetching TikTok Shop video:', error);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
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

    const existing = db.prepare('SELECT * FROM tiktok_shop_videos WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const fieldMap: Record<string, string> = {
      productId: 'product_id',
      title: 'title',
      hook: 'hook',
      format: 'format',
      status: 'status',
      views: 'views',
      likes: 'likes',
      comments: 'comments',
      shares: 'shares',
      ordersGenerated: 'orders_generated',
      gmvGenerated: 'gmv_generated',
      postedDate: 'posted_date',
      notes: 'notes',
    };

    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [camel, snake] of Object.entries(fieldMap)) {
      if (body[camel] !== undefined) {
        fields.push(`${snake} = ?`);
        values.push(body[camel]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    db.prepare(`UPDATE tiktok_shop_videos SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM tiktok_shop_videos WHERE id = ?').get(id) as Record<string, unknown>;
    return NextResponse.json(parseVideo(updated));
  } catch (error) {
    console.error('Error updating TikTok Shop video:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;

    const existing = db.prepare('SELECT * FROM tiktok_shop_videos WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM tiktok_shop_videos WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting TikTok Shop video:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
