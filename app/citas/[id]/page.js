'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const STATUS_OPTIONS = ['Programada','Confirmada','Completada','Cancelada','No asistió'];
const STATUS_BADGE = { 'Programada':'badge-blue','Confirmada':'badge-purple','Completada':'badge-green','Cancelada':'badge-red','No asistió':'badge-gray' };

export default function CitaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [appt, setAppt] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch(`/api/appointments/${id}`)
      .then(r => r.json())
      .then(d => {
        setAppt(d.data);
        setForm(d.data);
        setLoading(false);
      });
    fetch('/api/services').then(r => r.json()).then(d => setServices(d.data || []));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const body = { ...form };
    delete body.patients; delete body.services;
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) { const d = await res.json(); setAppt(d.data); setEditing(false); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta cita?')) return;
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    router.push('/citas');
  };

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (loading) return <AppShell><div className="loading-center"><div className="spinner" /></div></AppShell>;
  if (!appt) return <AppShell><div className="empty"><h3>Cita no encontrada</h3></div></AppShell>;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <Link href="/citas" style={{ color: 'var(--text2)', fontSize: 13, textDecoration: 'none' }}>← Citas</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Cita #{appt.id}</h1>
          <div className="page-sub">{appt.date_str} · {appt.time_str}</div>
        </div>
        <div className="flex gap-2">
          {editing
            ? <>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳' : '✓ Guardar'}</button>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancelar</button>
              </>
            : <>
                <button className="btn btn-ghost" onClick={() => setEditing(true)}>✏️ Editar</button>
                <Link href={`/reportes?appointment_id=${appt.id}`} className="btn btn-gold">📋 Reporte</Link>
                <button className="btn btn-danger" onClick={handleDelete}>🗑️</button>
              </>
          }
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Datos de la Cita</div></div>
          {editing ? (
            <div className="form-grid">
              <div className="field">
                <label className="label">Servicio</label>
                <select value={form.service_id} onChange={upd('service_id')}>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.modality}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Estado</label>
                <select value={form.status} onChange={upd('status')}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Fecha (DD-MM-YYYY)</label>
                <input value={form.date_str} onChange={upd('date_str')} />
              </div>
              <div className="field">
                <label className="label">Hora</label>
                <input type="time" value={form.time_str} onChange={upd('time_str')} />
              </div>
              <div className="field full">
                <label className="label">Notas</label>
                <textarea value={form.notes || ''} onChange={upd('notes')} rows={3} />
              </div>
            </div>
          ) : (
            <div className="info-panel" style={{ marginBottom: 0 }}>
              <div><div className="info-label">Paciente</div><div className="info-value">{appt.patients?.first_name} {appt.patients?.last_name}</div></div>
              <div><div className="info-label">Servicio</div><div className="info-value">{appt.services?.name}</div></div>
              <div><div className="info-label">Modalidad</div><div className="info-value">{appt.services?.modality}</div></div>
              <div>
                <div className="info-label">Estado</div>
                <div className="info-value"><span className={`badge ${STATUS_BADGE[appt.status] || 'badge-gray'}`}>{appt.status}</span></div>
              </div>
              <div><div className="info-label">Precio Efectivo</div><div className="info-value">S/ {appt.services?.price_cash}</div></div>
              <div><div className="info-label">Precio Tarjeta</div><div className="info-value">S/ {appt.services?.price_card}</div></div>
              {appt.notes && <div className="full"><div className="info-label">Notas</div><div className="info-value" style={{ fontWeight: 400 }}>{appt.notes}</div></div>}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Acciones Rápidas</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href={`/pacientes/${appt.patient_id}`} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
              👤 Ver perfil del paciente
            </Link>
            <Link href={`/reportes?appointment_id=${appt.id}`} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
              📋 Reporte clínico
            </Link>
            <Link href={`/pagos?appointment_id=${appt.id}`} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
              💰 Registrar pago
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
