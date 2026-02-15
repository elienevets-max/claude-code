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

export async function GET() {
  try {
    const db = getDb();

    const peaks = db.prepare('SELECT * FROM seasonal_peaks').all() as Record<string, unknown>[];

    return NextResponse.json(peaks.map(parseSeasonalPeak));
  } catch (error) {
    console.error('Error fetching seasonal peaks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seasonal peaks' },
      { status: 500 }
    );
  }
}
