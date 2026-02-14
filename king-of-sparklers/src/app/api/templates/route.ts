import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseTemplate(row: Record<string, unknown>) {
  return {
    id: row.id,
    touchNumber: row.touch_number,
    subject: row.subject,
    body: row.body,
    channel: row.channel,
  };
}

export async function GET() {
  try {
    const db = getDb();

    const templates = db.prepare(
      'SELECT * FROM outreach_templates ORDER BY touch_number ASC'
    ).all() as Record<string, unknown>[];

    return NextResponse.json(templates.map(parseTemplate));
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
