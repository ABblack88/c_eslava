import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// GET /api/patients/[id]
export async function GET(request, { params }) {
  const { id } = await params;
  const client = sb();

  const { data: patient, error } = await client
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  // Traer citas del paciente
  const { data: appointments } = await client
    .from('appointments')
    .select(`
      *,
      services ( name, category, modality, price_cash, price_card )
    `)
    .eq('patient_id', id)
    .order('date_str', { ascending: false });

  return NextResponse.json({ data: patient, appointments: appointments || [] });
}

// PUT /api/patients/[id]
export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const client = sb();

  const { data, error } = await client
    .from('patients')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

// DELETE /api/patients/[id]
export async function DELETE(request, { params }) {
  const { id } = await params;
  const client = sb();

  const { error } = await client.from('patients').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
