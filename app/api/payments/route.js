import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// GET /api/payments?appointment_id=&page=1
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const appointmentId = searchParams.get('appointment_id');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '30');
  const offset = (page - 1) * limit;

  const client = sb();

  let query = client
    .from('payments')
    .select(`
      *,
      patients ( first_name, last_name ),
      appointments ( date_str, time_str, services ( name ) )
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (appointmentId) query = query.eq('appointment_id', appointmentId);

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count });
}

// POST /api/payments
export async function POST(request) {
  const body = await request.json();
  const client = sb();

  const { data, error } = await client
    .from('payments')
    .insert([body])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
