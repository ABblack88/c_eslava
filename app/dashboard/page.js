'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

function statusBadge(status) {
  const map = {
    'Programada': 'badge-blue',
    'Confirmada': 'badge-purple',
    'Completada': 'badge-green',
    'Cancelada': 'badge-red',
    'No asistió': 'badge-gray',
  };
  return map[status] || 'badge-gray';
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppShell>
      <div className="loading-center"><div className="spinner" /></div>
    </AppShell>
  );

  const { today, todayAppointments = [], stats = {}, recentPatients = [] } = data || {};

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-sub">Hoy: {today}</div>
        </div>
        <div className="flex gap-2">
          <Link href="/citas/nueva" className="btn btn-primary">+ Nueva Cita</Link>
          <Link href="/pacientes/nuevo" className="btn btn-ghost">+ Paciente</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👤</div>
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-label">Pacientes totales</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{todayAppointments.length}</div>
          <div className="stat-label">Citas hoy</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">💰</div>
          <div className="stat-value">S/ {(stats.monthRevenue || 0).toFixed(0)}</div>
          <div className="stat-label">Ingresos del mes</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pendingAppointments}</div>
          <div className="stat-label">Citas pendientes</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Citas de hoy */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📅 Citas de hoy</div>
              <div className="card-sub">{todayAppointments.length} programadas</div>
            </div>
            <Link href="/citas" className="btn btn-ghost btn-sm">Ver todas</Link>
          </div>
          {todayAppointments.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <h3>Sin citas hoy</h3>
              <p>No hay citas programadas para hoy.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayAppointments.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: 'var(--bg3)',
                  borderRadius: 8, border: '1px solid var(--border2)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {a.patients?.first_name} {a.patients?.last_name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                      {a.time_str} · {a.services?.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge ${statusBadge(a.status)}`}>{a.status}</span>
                    <Link href={`/citas/${a.id}`} className="btn btn-ghost btn-sm">Ver</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pacientes recientes */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">👤 Pacientes recientes</div>
              <div className="card-sub">Últimos registros</div>
            </div>
            <Link href="/pacientes" className="btn btn-ghost btn-sm">Ver todos</Link>
          </div>
          {recentPatients.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">👥</div>
              <h3>Sin pacientes</h3>
              <p>Aún no hay pacientes registrados.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentPatients.map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: 'var(--bg3)',
                  borderRadius: 8, border: '1px solid var(--border2)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.first_name} {p.last_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      Registrado: {new Date(p.created_at).toLocaleDateString('es-PE')}
                    </div>
                  </div>
                  <Link href={`/pacientes/${p.id}`} className="btn btn-ghost btn-sm">Ver</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
