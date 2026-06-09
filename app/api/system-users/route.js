import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from('system_users')
    .select('id, full_name, email, role, active, notes, created_at')
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req) {
  const body = await req.json();
  const { full_name, email, role, notes, password } = body;
  if (!full_name || !email || !role)
    return NextResponse.json({ error: 'full_name, email y role son requeridos.' }, { status: 400 });

  const { data, error } = await supabase
    .from('system_users')
    .insert([{ full_name, email, role, notes: notes || null, password: password || null, active: true }])
    .select('id, full_name, email, role, active, notes, created_at')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req) {
  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'id requerido.' }, { status: 400 });

  const { data, error } = await supabase
    .from('system_users')
    .update(fields)
    .eq('id', id)
    .select('id, full_name, email, role, active, notes, created_at')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requerido.' }, { status: 400 });
  const { error } = await supabase.from('system_users').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
