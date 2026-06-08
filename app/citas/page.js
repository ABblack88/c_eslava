'use client';
import { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const STATUS_OPTIONS = ['Programada', 'Confirmada', 'Completada', 'Cancelada', 'No asistió'];
const STATUS_BADGE = { 'Programada':'badge-blue','Confirmada':'badge-purple','Completada':'badge-green','Cancelada':'badge-red','No asistió':'badge-gray' };

export default function CitasPage() {
  const [appointments, setAppointments] = useState([]);
  const [count, setCount] = useState(0);
  const [q, setQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    patient_id: '', service_id: '', date_str: '', time_str: '',
    status: 'Programada', notes: ''
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ q, limit: 50 });
    if (filterStatus) params.set('status', filterStatus);
    const res = await fetch(`/api/appointments?${params}`);
    const json = await res.json();
    setAppointments(json.data || []);
    setCount(json.count || 0);
    setLoading(false);
  }, [q, filterStatus]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  useEffect(() => {
    if (!showForm) return;
    Promise.all([
      fetch('/api/patients?limit=500').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
    ]).then(([p, s]) => { setPatients(p.data || []); setServices(s.data || []); });
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const body = {
      ...form,
      patient_id: parseInt(form.patient_id),
      service_id: parseInt(form.service_id),
    };
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (res.ok) {
      setShowForm(false);
      setForm({ patient_id: '', service_id: '', date_str: '', time_str: '', status: 'Programada', notes: '' });
      load();
    } else {
      setError(json.error || 'Error al guardar.');
    }
    setSaving(false);
  };

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Citas</h1>
          <div className="page-sub">{count} registros</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancelar' : '+ Nueva Cita'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 animate-fade">
          <div className="card-header"><div className="card-title">Agendar Cita</div></div>
          {error && <div className="alert alert-error mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label className="label">Paciente *</label>
                <select value={form.patient_id} onChange={upd('patient_id')} required>
                  <option value="">Seleccionar paciente</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Servicio *</label>
                <select value={form.service_id} onChange={upd('service_id')} required>
                  <option value="">Seleccionar servicio</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.modality} (S/ {s.price_cash})</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Fecha *</label>
                <input type="date" value={form.date_str_raw || ''} required
                  onChange={e => {
                    const d = e.target.value;
                    const [y,m,day] = d.split('-');
                    setForm(f => ({ ...f, date_str_raw: d, date_str: `${day}-${m}-${y}` }));
                  }} />
              </div>
              <div className="field">
                <label className="label">Hora *</label>
                <input type="time" value={form.time_str} onChange={upd('time_str')} required />
              </div>
              <div className="field">
                <label className="label">Estado</label>
                <select value={form.status} onChange={upd('status')}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Notas</label>
                <input value={form.notes} onChange={upd('notes')} placeholder="Observaciones..." />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳' : '✓ Agendar Cita'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Lista de Citas</div>
          <div className="flex gap-2 items-center">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '6px 10px', fontSize: 12, borderRadius: 6, width: 'auto' }}>
              <option value="">Todos los estados</option>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="search-input">
              <span className="search-icon"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" /></svg></span>
              <input placeholder="Buscar paciente o fecha..." value={q} onChange={e => setQ(e.target.value)} />
            </div>
          </div>
        </div>
        {loading ? <div className="loading-center"><div className="spinner" /></div>
        : appointments.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📅</div>
            <h3>Sin citas</h3>
            <p>No hay citas que coincidan con el filtro.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>ID</th><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Servicio</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td><span className="badge badge-gray">#{a.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{a.date_str}</td>
                    <td style={{ color: 'var(--text2)' }}>{a.time_str}</td>
                    <td style={{ fontWeight: 600 }}>{a.patients?.first_name} {a.patients?.last_name}</td>
                    <td style={{ color: 'var(--text2)' }}>{a.services?.name}</td>
                    <td><span className={`badge ${STATUS_BADGE[a.status] || 'badge-gray'}`}>{a.status}</span></td>
                    <td><Link href={`/citas/${a.id}`} className="btn btn-ghost btn-sm">Ver →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
