import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function parseSafetyCertification(row: Record<string, unknown>) {
  return {
    id: row.id,
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    certificationNumber: row.certification_number,
    certifiedDate: row.certified_date,
    expiryDate: row.expiry_date,
    status: row.status,
    checklistItems: row.checklist_items ? JSON.parse(row.checklist_items as string) : [],
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = 'SELECT * FROM safety_certifications';
    const params: string[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const certifications = db.prepare(query).all(...params) as Record<string, unknown>[];

    return NextResponse.json(certifications.map(parseSafetyCertification));
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
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
      INSERT INTO safety_certifications (id, venue_name, venue_address, contact_name, contact_email, contact_phone, certification_number, certified_date, expiry_date, status, checklist_items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      body.venueName || '',
      body.venueAddress || '',
      body.contactName || '',
      body.contactEmail || '',
      body.contactPhone || '',
      body.certificationNumber || '',
      body.certifiedDate || '',
      body.expiryDate || '',
      body.status || 'pending',
      body.checklistItems ? JSON.stringify(body.checklistItems) : '[]'
    );

    const certification = db.prepare('SELECT * FROM safety_certifications WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseSafetyCertification(certification), { status: 201 });
  } catch (error) {
    console.error('Error creating certification:', error);
    return NextResponse.json(
      { error: 'Failed to create certification' },
      { status: 500 }
    );
  }
}
