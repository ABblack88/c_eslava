import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// GET /api/appointments?q=&date=&status=&page=1&limit=20
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const date = searchParams.get('date') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const client = sb();

  let query = client
    .from('appointments')
    .select(`
      *,
      patients ( id, first_name, last_name, contact ),
      services ( id, name, category, modality, price_cash, price_card )
    `, { count: 'exact' });

  if (date) query = query.eq('date_str', date);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query
    .order('date_str', { ascending: false })
    .order('time_str', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter by patient name if q
  let filtered = data || [];
  if (q) {
    const ql = q.toLowerCase();
    filtered = filtered.filter(a =>
      `${a.patients?.first_name} ${a.patients?.last_name}`.toLowerCase().includes(ql) ||
      a.date_str?.includes(q)
    );
  }

  return NextResponse.json({ data: filtered, count, page, limit });
}

// POST /api/appointments
export async function POST(request) {
  const body = await request.json();
  const client = sb();

  const { data, error } = await client
    .from('appointments')
    .insert([body])
    .select(`
      *,
      patients ( first_name, last_name ),
      services ( name, category )
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
