import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseSeasonalPeak(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    peakStart: row.peak_start,
    peakEnd: row.peak_end,
    preloadWeeks: row.preload_weeks,
    checklistItems: row.checklist_items ? JSON.parse(row.checklist_items as string) : [],
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

    const existing = db.prepare('SELECT * FROM seasonal_peaks WHERE id = ?').get(id) as Record<string, unknown> | undefined;

    if (!existing) {
      return NextResponse.json(
        { error: 'Seasonal peak not found' },
        { status: 404 }
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, string> = {
      name: 'name',
      peakStart: 'peak_start',
      peakEnd: 'peak_end',
      preloadWeeks: 'preload_weeks',
    };

    for (const [camel, snake] of Object.entries(fieldMap)) {
      if (body[camel] !== undefined) {
        fields.push(`${snake} = ?`);
        values.push(body[camel]);
      }
    }

    if (body.checklistItems !== undefined) {
      fields.push('checklist_items = ?');
      values.push(JSON.stringify(body.checklistItems));
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    db.prepare(`UPDATE seasonal_peaks SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM seasonal_peaks WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseSeasonalPeak(updated));
  } catch (error) {
    console.error('Error updating seasonal peak:', error);
    return NextResponse.json(
      { error: 'Failed to update seasonal peak' },
      { status: 500 }
    );
  }
}
