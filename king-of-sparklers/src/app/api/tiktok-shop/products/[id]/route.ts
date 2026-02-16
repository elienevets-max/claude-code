import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseProduct(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    price: row.price,
    commissionRate: row.commission_rate,
    status: row.status,
    sampleStatus: row.sample_status,
    tiktokUrl: row.tiktok_url,
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
    const row = db.prepare('SELECT * FROM tiktok_shop_products WHERE id = ?').get(id) as Record<string, unknown> | undefined;

    if (!row) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(parseProduct(row));
  } catch (error) {
    console.error('Error fetching TikTok Shop product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
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

    const existing = db.prepare('SELECT * FROM tiktok_shop_products WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const fieldMap: Record<string, string> = {
      name: 'name',
      sku: 'sku',
      category: 'category',
      price: 'price',
      commissionRate: 'commission_rate',
      status: 'status',
      sampleStatus: 'sample_status',
      tiktokUrl: 'tiktok_url',
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
    db.prepare(`UPDATE tiktok_shop_products SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM tiktok_shop_products WHERE id = ?').get(id) as Record<string, unknown>;
    return NextResponse.json(parseProduct(updated));
  } catch (error) {
    console.error('Error updating TikTok Shop product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;

    const existing = db.prepare('SELECT * FROM tiktok_shop_products WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM tiktok_shop_products WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting TikTok Shop product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
