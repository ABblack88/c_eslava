import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function GET(request, { params }) {
  const { id } = await params;
  const client = sb();

  const { data, error } = await client
    .from('appointments')
    .select(`
      *,
      patients ( * ),
      services ( * )
    `)
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const client = sb();

  const { data, error } = await client
    .from('appointments')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      patients ( first_name, last_name ),
      services ( name )
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const client = sb();

  const { error } = await client.from('appointments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
