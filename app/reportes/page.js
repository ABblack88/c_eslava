'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const SECTION_FIELDS = [
  ['motivo_consulta', 'Motivo de consulta'],
  ['anamnesis', 'Anamnesis'],
  ['examen_fisico', 'Examen físico'],
  ['examen_clinico', 'Examen clínico / Diagnóstico'],
  ['plan_tratamiento', 'Plan de tratamiento'],
  ['evolucion', 'Evolución'],
  ['observaciones', 'Observaciones'],
];

export default function ReportesPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');

  const [appointments, setAppointments] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null);
  const [report, setReport] = useState(null);
  const [payload, setPayload] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load appointment list
  useEffect(() => {
    fetch(`/api/reports?q=${encodeURIComponent(q)}&limit=50`)
      .then(r => r.json())
      .then(d => { setAppointments(d.data || []); setLoading(false); });
  }, [q]);

  // Load specific report when appointment selected
  useEffect(() => {
    if (!appointmentId) { setCurrent(null); setReport(null); setPayload({}); return; }
    fetch(`/api/appointments/${appointmentId}`)
      .then(r => r.json())
      .then(d => setCurrent(d.data));
    fetch(`/api/reports?appointment_id=${appointmentId}`)
      .then(r => r.json())
      .then(d => {
        setReport(d.data);
        setPayload(d.data?.report_text || {});
      });
  }, [appointmentId]);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointment_id: parseInt(appointmentId), report_text: payload }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Reportes Clínicos</h1>
          <div className="page-sub">Selecciona una cita para crear o editar su reporte</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        {/* Report editor */}
        <div className="card">
          {current ? (
            <>
              <div className="card-header">
                <div>
                  <div className="card-title">Reporte de Cita #{current.id}</div>
                  <div className="card-sub">
                    {current.patients?.first_name} {current.patients?.last_name} · {current.date_str} {current.time_str}
                  </div>
                </div>
                {saved && <span className="badge badge-green">✓ Guardado</span>}
              </div>
              <div className="info-panel" style={{ marginBottom: 16 }}>
                <div><div className="info-label">Servicio</div><div className="info-value">{current.services?.name}</div></div>
                <div><div className="info-label">Modalidad</div><div className="info-value">{current.services?.modality}</div></div>
                <div><div className="info-label">Estado</div><div className="info-value">{current.status}</div></div>
                <div><div className="info-label">Precio</div><div className="info-value">S/ {current.services?.price_cash}</div></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {SECTION_FIELDS.map(([key, label]) => (
                  <div className="field" key={key}>
                    <label className="label">{label}</label>
                    <textarea
                      rows={3}
                      value={payload[key] || ''}
                      onChange={e => setPayload(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={`Escribir ${label.toLowerCase()}...`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Guardando...' : '✓ Guardar Reporte'}
                </button>
                <Link href={`/citas/${current.id}`} className="btn btn-ghost">Ver Cita</Link>
              </div>
            </>
          ) : (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <h3>Selecciona una cita</h3>
              <p>Haz clic en "Editar reporte" de la lista para comenzar.</p>
            </div>
          )}
        </div>

        {/* Appointment list */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Citas</div>
            <div className="search-input">
              <span className="search-icon"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" /></svg></span>
              <input placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} />
            </div>
          </div>
          {loading ? <div className="loading-center"><div className="spinner" /></div>
          : appointments.length === 0 ? (
            <div className="empty" style={{ padding: 32 }}>
              <p>Sin citas registradas</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {appointments.map(a => (
                <Link
                  key={a.id}
                  href={`/reportes?appointment_id=${a.id}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', background: appointmentId == a.id ? 'var(--brand-glow)' : 'var(--bg3)',
                    borderRadius: 8, border: `1px solid ${appointmentId == a.id ? 'var(--brand)' : 'var(--border2)'}`,
                    textDecoration: 'none', transition: 'all .15s'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                      {a.patients?.first_name} {a.patients?.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                      {a.date_str} · {a.services?.name}
                    </div>
                  </div>
                  <span className={`badge ${a.appointment_reports?.length ? 'badge-green' : 'badge-gray'}`}>
                    {a.appointment_reports?.length ? '✓ Con reporte' : 'Sin reporte'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
