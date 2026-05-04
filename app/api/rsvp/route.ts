import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const rsvps = db.prepare('SELECT * FROM rsvps ORDER BY id DESC').all();
    return NextResponse.json(rsvps);
  } catch (error) {
    console.error('RSVP fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSVPs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, attendance, guests, phone, notes } = body;

    if (!name || !attendance) {
      return NextResponse.json(
        { error: 'Name and attendance are required' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    if (phone) {
      const existing = db.prepare('SELECT id FROM rsvps WHERE phone = ?').get(phone);
      if (existing) {
        return NextResponse.json(
          { error: 'EXISTING_PHONE', message: 'Nombor telefon ini sudah didaftarkan.' },
          { status: 400 }
        );
      }
    }

    const stmt = db.prepare(
      'INSERT INTO rsvps (name, attendance, guests, phone, notes) VALUES (?, ?, ?, ?, ?)'
    );
    
    const info = stmt.run(name, attendance, guests || 0, phone || '', notes || '');

    return NextResponse.json(
      { success: true, id: info.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error('RSVP insertion error:', error);
    return NextResponse.json(
      { error: 'Failed to submit RSVP' },
      { status: 500 }
    );
  }
}
