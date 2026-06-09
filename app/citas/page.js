'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const STATUS_OPTIONS = ['Programada', 'Confirmada', 'Completada', 'Cancelada', 'No asistió'];
const STATUS_BADGE = { 'Programada':'badge-blue','Confirmada':'badge-purple','Completada':'badge-green','Cancelada':'badge-red','No asistió':'badge-gray' };
const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

/* ── Calendario ──────────────────────────────── */
function CalendarView({ appointments }) {
  const today = new Date();
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState(null);

  // Índice citas por día "DD-MM-YYYY"
  const byDay = useMemo(() => {
    const map = {};
    appointments.forEach(a => {
      if (!map[a.date_str]) map[a.date_str] = [];
      map[a.date_str].push(a);
    });
    return map;
  }, [appointments]);

  const firstDay = new Date(cur.y, cur.m, 1).getDay();
  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
  const daysInPrev = new Date(cur.y, cur.m, 0).getDate();

  const cells = [];
  // Días del mes anterior
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, month: cur.m - 1, year: cur.y, other: true });
  // Días del mes actual
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, month: cur.m, year: cur.y, other: false });
  // Rellenar hasta múltiplo de 7
  let next = 1;
  while (cells.length % 7 !== 0)
    cells.push({ day: next++, month: cur.m + 1, year: cur.y, other: true });

  const fmtKey = (d, m, y) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${dd}-${mm}-${y}`;
  };

  const todayKey = fmtKey(today.getDate(), today.getMonth(), today.getFullYear());

  const selectedCitas = selected ? (byDay[selected] || []) : [];

  return (
    <div>
      <div className="calendar-header">
        <div className="calendar-month">{MONTHS[cur.m]} {cur.y}</div>
        <div className="calendar-nav">
          <button onClick={() => setCur(c => {
            const d = new Date(c.y, c.m - 1, 1);
            return { y: d.getFullYear(), m: d.getMonth() };
          })}>‹</button>
          <button onClick={() => setCur({ y: today.getFullYear(), m: today.getMonth() })}
            style={{ width: 'auto', padding: '0 10px', fontSize: 11, fontWeight: 700 }}>
            Hoy
          </button>
          <button onClick={() => setCur(c => {
            const d = new Date(c.y, c.m + 1, 1);
            return { y: d.getFullYear(), m: d.getMonth() };
          })}>›</button>
        </div>
      </div>

      <div className="calendar-grid">
        {DAYS.map(d => <div key={d} className="calendar-dow">{d}</div>)}
        {cells.map((cell, i) => {
          const key = fmtKey(cell.day, cell.month, cell.year);
          const citas = byDay[key] || [];
          const isToday = key === todayKey;
          const isSelected = key === selected;
          return (
            <div
              key={i}
              className={`calendar-day${cell.other ? ' other-month' : ''}${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
              onClick={() => !cell.other && setSelected(isSelected ? null : key)}
            >
              <span className="calendar-day-num">{cell.day}</span>
              {citas.slice(0, 3).map((a, j) => (
                <span key={j} className={`cal-chip cal-chip-${a.status || 'default'}`}>
                  {a.time_str} {a.patients?.first_name}
                </span>
              ))}
              {citas.length > 3 && (
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>+{citas.length - 3} más</span>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="calendar-detail animate-fade">
          <div className="calendar-detail-title">
            📅 Citas del {selected} ({selectedCitas.length})
          </div>
          {selectedCitas.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Sin citas programadas para este día.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedCitas.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--bg2)', borderRadius: 8, padding: '10px 14px',
                  border: '1px solid var(--border)'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>
                      {a.patients?.first_name} {a.patients?.last_name}
                    </span>
                    <span style={{ margin: '0 8px', color: 'var(--text3)' }}>·</span>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{a.time_str}</span>
                    <span style={{ margin: '0 8px', color: 'var(--text3)' }}>·</span>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{a.services?.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge ${STATUS_BADGE[a.status] || 'badge-gray'}`}>{a.status}</span>
                    <Link href={`/citas/${a.id}`} className="btn btn-ghost btn-sm">Ver →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Página Principal ────────────────────────── */
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
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

  const [form, setForm] = useState({
    patient_id: '', service_id: '', date_str: '', time_str: '',
    status: 'Programada', notes: ''
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ q, limit: 200 });
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Toggle lista / calendario */}
          <div className="view-toggle">
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
              ☰ Lista
            </button>
            <button className={viewMode === 'calendar' ? 'active' : ''} onClick={() => setViewMode('calendar')}>
              📅 Calendario
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ Cancelar' : '+ Nueva Cita'}
          </button>
        </div>
      </div>

      {/* Formulario nueva cita */}
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

      {/* Vista Calendario */}
      {viewMode === 'calendar' && (
        <div className="card animate-fade">
          {loading
            ? <div className="loading-center"><div className="spinner" /></div>
            : <CalendarView appointments={appointments} />
          }
        </div>
      )}

      {/* Vista Lista */}
      {viewMode === 'list' && (
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
                <span className="search-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" /></svg>
                </span>
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
      )}
    </AppShell>
  );
}
