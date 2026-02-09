import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseBrandScript(row: Record<string, unknown>) {
  return {
    id: row.id,
    hero: row.hero,
    externalProblem: row.external_problem,
    internalProblem: row.internal_problem,
    philosophicalProblem: row.philosophical_problem,
    guide: row.guide,
    empathy: row.empathy,
    authority: row.authority,
    plan: row.plan ? JSON.parse(row.plan as string) : [],
    directCta: row.direct_cta,
    transitionalCta: row.transitional_cta,
    failure: row.failure,
    success: row.success,
    createdAt: row.created_at,
  };
}

export async function GET() {
  try {
    const db = getDb();

    const brandScript = db.prepare(
      'SELECT * FROM brand_scripts ORDER BY created_at DESC LIMIT 1'
    ).get() as Record<string, unknown> | undefined;

    if (!brandScript) {
      return NextResponse.json(
        { error: 'No brand script found' },
        { status: 404 }
      );
    }

    return NextResponse.json(parseBrandScript(brandScript));
  } catch (error) {
    console.error('Error fetching brand script:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand script' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const id = crypto.randomUUID();

    const stmt = db.prepare(`
      INSERT INTO brand_scripts (id, hero, external_problem, internal_problem, philosophical_problem, guide, empathy, authority, plan, direct_cta, transitional_cta, failure, success, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      id,
      body.hero || '',
      body.externalProblem || '',
      body.internalProblem || '',
      body.philosophicalProblem || '',
      body.guide || '',
      body.empathy || '',
      body.authority || '',
      body.plan ? JSON.stringify(body.plan) : '[]',
      body.directCta || '',
      body.transitionalCta || '',
      body.failure || '',
      body.success || ''
    );

    const brandScript = db.prepare('SELECT * FROM brand_scripts WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseBrandScript(brandScript), { status: 201 });
  } catch (error) {
    console.error('Error creating brand script:', error);
    return NextResponse.json(
      { error: 'Failed to create brand script' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    const current = db.prepare(
      'SELECT * FROM brand_scripts ORDER BY created_at DESC LIMIT 1'
    ).get() as Record<string, unknown> | undefined;

    if (!current) {
      return NextResponse.json(
        { error: 'No brand script found to update' },
        { status: 404 }
      );
    }

    const id = current.id as string;
    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, string> = {
      hero: 'hero',
      externalProblem: 'external_problem',
      internalProblem: 'internal_problem',
      philosophicalProblem: 'philosophical_problem',
      guide: 'guide',
      empathy: 'empathy',
      authority: 'authority',
      directCta: 'direct_cta',
      transitionalCta: 'transitional_cta',
      failure: 'failure',
      success: 'success',
    };

    for (const [camel, snake] of Object.entries(fieldMap)) {
      if (body[camel] !== undefined) {
        fields.push(`${snake} = ?`);
        values.push(body[camel]);
      }
    }

    if (body.plan !== undefined) {
      fields.push('plan = ?');
      values.push(JSON.stringify(body.plan));
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    db.prepare(`UPDATE brand_scripts SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM brand_scripts WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseBrandScript(updated));
  } catch (error) {
    console.error('Error updating brand script:', error);
    return NextResponse.json(
      { error: 'Failed to update brand script' },
      { status: 500 }
    );
  }
}
