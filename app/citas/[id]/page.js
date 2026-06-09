'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const STATUS_OPTIONS = ['Programada','Confirmada','Completada','Cancelada','No asistió'];
const STATUS_BADGE = { 'Programada':'badge-blue','Confirmada':'badge-purple','Completada':'badge-green','Cancelada':'badge-red','No asistió':'badge-gray' };
const ENTRY_TYPES = [
  { value: 'evolucion',   label: '📈 Evolución' },
  { value: 'observacion', label: '💬 Observación' },
  { value: 'antecedente', label: '⚕️ Antecedente' },
  { value: 'inicial',     label: '📋 Inicial' },
];

export default function CitaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [appt, setAppt] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  // Historia clínica rápida
  const [showHistoria, setShowHistoria] = useState(false);
  const [hForm, setHForm] = useState({ entry_type: 'evolucion', title: '', content: '', created_by: '' });
  const [hSaving, setHSaving] = useState(false);
  const [hMsg, setHMsg] = useState('');

  useEffect(() => {
    fetch(`/api/appointments/${id}`)
      .then(r => r.json())
      .then(d => { setAppt(d.data); setForm(d.data); setLoading(false); });
    fetch('/api/services').then(r => r.json()).then(d => setServices(d.data || []));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const body = { ...form };
    delete body.patients; delete body.services;
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) { const d = await res.json(); setAppt(d.data); setEditing(false); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta cita?')) return;
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    router.push('/citas');
  };

  const handleHistoria = async (e) => {
    e.preventDefault(); setHSaving(true); setHMsg('');
    // Convertir DD-MM-YYYY a YYYY-MM-DD para la BD
    const parts = appt.date_str ? appt.date_str.split('-') : [];
    const entryDate = parts.length === 3
      ? `${parts[2]}-${parts[1]}-${parts[0]}`
      : new Date().toISOString().split('T')[0];
    const body = { patient_id: appt.patient_id, appointment_id: parseInt(id), entry_date: entryDate, ...hForm };
    const res = await fetch('/api/clinical-history', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) {
      setHMsg('✓ Registrado en historia clínica.');
      setHForm({ entry_type: 'evolucion', title: '', content: '', created_by: '' });
      setShowHistoria(false);
    } else { setHMsg('Error al guardar.'); }
    setHSaving(false);
  };

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const hUpd = (k) => (e) => setHForm(f => ({ ...f, [k]: e.target.value }));

  if (loading) return <AppShell><div className="loading-center"><div className="spinner" /></div></AppShell>;
  if (!appt) return <AppShell><div className="empty"><h3>Cita no encontrada</h3></div></AppShell>;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <Link href="/citas" style={{ color:'var(--text2)', fontSize:13, textDecoration:'none' }}>← Citas</Link>
          <h1 className="page-title" style={{ marginTop:4 }}>Cita #{appt.id}</h1>
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

      <div className="grid-2" style={{ gap:20, alignItems:'start' }}>
        {/* Datos de la Cita */}
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
            <div className="info-panel" style={{ marginBottom:0 }}>
              <div><div className="info-label">Paciente</div><div className="info-value">{appt.patients?.first_name} {appt.patients?.last_name}</div></div>
              <div><div className="info-label">Servicio</div><div className="info-value">{appt.services?.name}</div></div>
              <div><div className="info-label">Modalidad</div><div className="info-value">{appt.services?.modality}</div></div>
              <div>
                <div className="info-label">Estado</div>
                <div className="info-value"><span className={`badge ${STATUS_BADGE[appt.status]||'badge-gray'}`}>{appt.status}</span></div>
              </div>
              <div><div className="info-label">Precio Efectivo</div><div className="info-value">S/ {appt.services?.price_cash}</div></div>
              <div><div className="info-label">Precio Tarjeta</div><div className="info-value">S/ {appt.services?.price_card}</div></div>
              {appt.notes && <div className="full"><div className="info-label">Notas</div><div className="info-value" style={{ fontWeight:400 }}>{appt.notes}</div></div>}
            </div>
          )}
        </div>

        {/* Acciones + Historia Clínica rápida */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Acciones Rápidas</div></div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <Link href={`/pacientes/${appt.patient_id}`} className="btn btn-ghost" style={{ justifyContent:'flex-start' }}>
                👤 Ver perfil del paciente
              </Link>
              <button className="btn btn-ghost" style={{ justifyContent:'flex-start', color:'var(--brand)' }}
                onClick={() => setShowHistoria(v => !v)}>
                ⚕️ {showHistoria ? 'Cerrar entrada clínica' : 'Agregar entrada clínica'}
              </button>
              <Link href={`/reportes?appointment_id=${appt.id}`} className="btn btn-ghost" style={{ justifyContent:'flex-start' }}>
                📋 Reporte clínico
              </Link>
              <Link href={`/pagos?appointment_id=${appt.id}`} className="btn btn-ghost" style={{ justifyContent:'flex-start' }}>
                💰 Registrar pago
              </Link>
            </div>
          </div>

          {hMsg && <div className="alert alert-success">{hMsg}</div>}

          {showHistoria && (
            <div className="card" style={{ borderColor:'var(--brand)', boxShadow:'0 0 0 1px var(--brand-glow)' }}>
              <div className="card-header"><div className="card-title">⚕️ Nueva Entrada Clínica</div></div>
              <div style={{ fontSize:12, color:'var(--text2)', marginBottom:12 }}>
                Vinculada a esta cita · Paciente: <strong>{appt.patients?.first_name} {appt.patients?.last_name}</strong>
              </div>
              <form onSubmit={handleHistoria}>
                <div className="form-grid">
                  <div className="field">
                    <label className="label">Tipo *</label>
                    <select value={hForm.entry_type} onChange={hUpd('entry_type')}>
                      {ENTRY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="label">Terapeuta</label>
                    <input value={hForm.created_by} onChange={hUpd('created_by')} placeholder="Nombre" />
                  </div>
                  <div className="field full">
                    <label className="label">Título *</label>
                    <input value={hForm.title} onChange={hUpd('title')}
                      placeholder="Ej: Sesión de descarga, Evolución favorable..." required />
                  </div>
                  <div className="field full">
                    <label className="label">Descripción *</label>
                    <textarea value={hForm.content} onChange={hUpd('content')} rows={3}
                      placeholder="Describe síntomas, tratamiento aplicado, evolución..." required />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary" disabled={hSaving}>{hSaving ? '⏳' : '✓ Guardar Entrada'}</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowHistoria(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
