import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// GET /api/reports?q=&page=1
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const appointmentId = searchParams.get('appointment_id');
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const client = sb();

  if (appointmentId) {
    const { data, error } = await client
      .from('appointment_reports')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single();
    if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || null });
  }

  // List all reports with appointment info
  let query = client
    .from('appointments')
    .select(`
      id, date_str, time_str, status,
      patients ( first_name, last_name ),
      services ( name ),
      appointment_reports ( id, updated_at )
    `, { count: 'exact' })
    .order('date_str', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let filtered = data || [];
  if (q) {
    const ql = q.toLowerCase();
    filtered = filtered.filter(a =>
      `${a.patients?.first_name} ${a.patients?.last_name}`.toLowerCase().includes(ql) ||
      a.date_str?.includes(q)
    );
  }

  return NextResponse.json({ data: filtered, count });
}

// POST /api/reports
export async function POST(request) {
  const body = await request.json();
  const client = sb();

  const { appointment_id, report_text, image_paths } = body;

  const { data, error } = await client
    .from('appointment_reports')
    .upsert({
      appointment_id,
      report_text: report_text || {},
      image_paths: image_paths || [],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'appointment_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
