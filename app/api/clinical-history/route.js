import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const patient_id = searchParams.get('patient_id');
  if (!patient_id) return NextResponse.json({ error: 'patient_id requerido.' }, { status: 400 });

  const { data, error } = await sb()
    .from('clinical_history')
    .select('*')
    .eq('patient_id', patient_id)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req) {
  const body = await req.json();
  const { patient_id, appointment_id, entry_date, entry_type, title, content, created_by } = body;
  if (!patient_id || !title || !content || !entry_type)
    return NextResponse.json({ error: 'patient_id, entry_type, title y content son requeridos.' }, { status: 400 });

  const { data, error } = await sb()
    .from('clinical_history')
    .insert([{ patient_id, appointment_id: appointment_id || null, entry_date: entry_date || new Date().toISOString().split('T')[0], entry_type, title, content, created_by: created_by || null }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requerido.' }, { status: 400 });
  const { error } = await sb().from('clinical_history').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
