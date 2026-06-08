import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// GET /api/dashboard - resumen del dia y estadisticas generales
export async function GET() {
  const client = sb();

  // Fecha de hoy en formato DD-MM-YYYY (mismo formato que usa el sistema)
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const todayStr = `${day}-${month}-${year}`;

  // Citas de hoy
  const { data: todayAppointments, error: apptErr } = await client
    .from('appointments')
    .select(`
      id, date_str, time_str, status, notes,
      patients ( first_name, last_name, contact ),
      services ( name, category, price_cash, price_card )
    `)
    .eq('date_str', todayStr)
    .order('time_str', { ascending: true });

  // Total de pacientes
  const { count: totalPatients } = await client
    .from('patients')
    .select('id', { count: 'exact', head: true });

  // Total de citas
  const { count: totalAppointments } = await client
    .from('appointments')
    .select('id', { count: 'exact', head: true });

  // Citas programadas (pendientes)
  const { count: pendingAppointments } = await client
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Programada');

  // Pagos del mes actual
  const startOfMonth = `${year}-${month}-01`;
  const { data: monthPayments } = await client
    .from('payments')
    .select('amount, method')
    .gte('created_at', startOfMonth);

  const monthRevenue = (monthPayments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

  // Ultimos 5 pacientes registrados
  const { data: recentPatients } = await client
    .from('patients')
    .select('id, first_name, last_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    today: todayStr,
    todayAppointments: todayAppointments || [],
    stats: {
      totalPatients: totalPatients || 0,
      totalAppointments: totalAppointments || 0,
      pendingAppointments: pendingAppointments || 0,
      monthRevenue,
    },
    recentPatients: recentPatients || [],
  });
}
