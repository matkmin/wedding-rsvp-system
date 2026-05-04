import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch RSVPs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, attendance, phone, notes, guests } = await request.json();

    if (!name || !attendance || (attendance === 'Hadir' && !phone)) {
      return NextResponse.json({ message: 'Maklumat tidak lengkap!' }, { status: 400 });
    }

    // Check for duplicate phone (only if attending)
    if (attendance === 'Hadir' && phone) {
      const { data: existing, error: checkError } = await supabase
        .from('rsvps')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        return NextResponse.json({ message: 'Nombor telefon ini telah digunakan!' }, { status: 400 });
      }
    }

    const { error: insertError } = await supabase
      .from('rsvps')
      .insert([{ 
        name, 
        attendance, 
        phone: phone || null, 
        notes, 
        guests: parseInt(guests) || 0 
      }]);

    if (insertError) throw insertError;

    return NextResponse.json({ message: 'RSVP Berjaya!' });
  } catch (error) {
    console.error('RSVP Error:', error);
    return NextResponse.json({ message: 'Ralat pelayan. Sila cuba lagi.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID diperlukan!' }, { status: 400 });
    }

    const { error } = await supabase
      .from('rsvps')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Data berjaya dipadam!' });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ message: 'Gagal memadam data.' }, { status: 500 });
  }
}
