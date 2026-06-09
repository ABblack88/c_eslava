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
  const all = searchParams.get('all'); // si all=1, trae activos e inactivos
  const client = sb();

  let query = client.from('services').select('*').order('category').order('name');
  if (!all) query = query.eq('active', true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request) {
  const body = await request.json();
  const client = sb();
  const { data, error } = await client.from('services').insert([body]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request) {
  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'id requerido.' }, { status: 400 });
  const client = sb();
  const { data, error } = await client
    .from('services')
    .update(fields)
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
