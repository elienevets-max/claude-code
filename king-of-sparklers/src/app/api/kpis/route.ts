import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseKpi(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    value: row.value,
    target: row.target,
    unit: row.unit,
    period: row.period,
    category: row.category,
  };
}

export async function GET() {
  try {
    const db = getDb();

    const kpis = db.prepare('SELECT * FROM kpis').all() as Record<string, unknown>[];

    return NextResponse.json(kpis.map(parseKpi));
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    const {
      id,
      name,
      value,
      target,
      unit,
      period,
      category,
    } = body;

    if (id) {
      const existing = db.prepare('SELECT * FROM kpis WHERE id = ?').get(id);

      if (existing) {
        const fields: string[] = [];
        const values: unknown[] = [];

        const fieldMap: Record<string, string> = {
          name: 'name',
          value: 'value',
          target: 'target',
          unit: 'unit',
          period: 'period',
          category: 'category',
        };

        for (const [camel, snake] of Object.entries(fieldMap)) {
          if (body[camel] !== undefined) {
            fields.push(`${snake} = ?`);
            values.push(body[camel]);
          }
        }

        if (fields.length > 0) {
          values.push(id);
          db.prepare(`UPDATE kpis SET ${fields.join(', ')} WHERE id = ?`).run(...values);
        }

        const updated = db.prepare('SELECT * FROM kpis WHERE id = ?').get(id) as Record<string, unknown>;
        return NextResponse.json(parseKpi(updated));
      }
    }

    const newId = id || crypto.randomUUID();

    const stmt = db.prepare(`
      INSERT INTO kpis (id, name, value, target, unit, period, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newId,
      name || '',
      value ?? 0,
      target ?? 0,
      unit || '',
      period || '',
      category || ''
    );

    const kpi = db.prepare('SELECT * FROM kpis WHERE id = ?').get(newId) as Record<string, unknown>;

    return NextResponse.json(parseKpi(kpi), { status: 201 });
  } catch (error) {
    console.error('Error creating/updating KPI:', error);
    return NextResponse.json(
      { error: 'Failed to create/update KPI' },
      { status: 500 }
    );
  }
}
