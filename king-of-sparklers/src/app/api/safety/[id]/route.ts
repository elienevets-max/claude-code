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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;

    const certification = db.prepare('SELECT * FROM safety_certifications WHERE id = ?').get(id) as Record<string, unknown> | undefined;

    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(parseSafetyCertification(certification));
  } catch (error) {
    console.error('Error fetching certification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certification' },
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

    const existing = db.prepare('SELECT * FROM safety_certifications WHERE id = ?').get(id) as Record<string, unknown> | undefined;

    if (!existing) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, string> = {
      venueName: 'venue_name',
      venueAddress: 'venue_address',
      contactName: 'contact_name',
      contactEmail: 'contact_email',
      contactPhone: 'contact_phone',
      certificationNumber: 'certification_number',
      certifiedDate: 'certified_date',
      expiryDate: 'expiry_date',
      status: 'status',
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

    db.prepare(`UPDATE safety_certifications SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM safety_certifications WHERE id = ?').get(id) as Record<string, unknown>;

    return NextResponse.json(parseSafetyCertification(updated));
  } catch (error) {
    console.error('Error updating certification:', error);
    return NextResponse.json(
      { error: 'Failed to update certification' },
      { status: 500 }
    );
  }
}
