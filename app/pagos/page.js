'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const METHODS = ['Efectivo','Tarjeta','Transferencia','Yape','Plin','Otro'];

export default function PagosPage() {
  const searchParams = useSearchParams();
  const preApptId = searchParams.get('appointment_id');

  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!preApptId);
  const [appointments, setAppointments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    appointment_id: preApptId || '', patient_id: '',
    amount: '', method: 'Efectivo', igv_applied: false, note: ''
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/payments?limit=50');
    const json = await res.json();
    setPayments(json.data || []);
    const t = (json.data || []).reduce((s, p) => s + (p.amount || 0), 0);
    setTotal(t);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!showForm) return;
    fetch('/api/appointments?limit=200').then(r => r.json()).then(d => setAppointments(d.data || []));
  }, [showForm]);

  // Auto-fill patient when appointment selected
  useEffect(() => {
    if (!form.appointment_id) return;
    const a = appointments.find(x => x.id == form.appointment_id);
    if (a) setForm(f => ({ ...f, patient_id: a.patient_id, amount: a.services?.price_cash || '' }));
  }, [form.appointment_id, appointments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const body = {
      ...form,
      appointment_id: parseInt(form.appointment_id),
      patient_id: form.patient_id ? parseInt(form.patient_id) : null,
      amount: parseFloat(form.amount),
    };
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (res.ok) {
      setShowForm(false);
      setForm({ appointment_id: '', patient_id: '', amount: '', method: 'Efectivo', igv_applied: false, note: '' });
      load();
    } else { setError(json.error || 'Error al guardar.'); }
    setSaving(false);
  };

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Pagos</h1>
          <div className="page-sub">Total registrado: <strong>S/ {total.toFixed(2)}</strong></div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancelar' : '+ Registrar Pago'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 animate-fade">
          <div className="card-header"><div className="card-title">Registrar Pago</div></div>
          {error && <div className="alert alert-error mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field full">
                <label className="label">Cita *</label>
                <select value={form.appointment_id} onChange={upd('appointment_id')} required>
                  <option value="">Seleccionar cita</option>
                  {appointments.map(a => (
                    <option key={a.id} value={a.id}>
                      #{a.id} — {a.patients?.first_name} {a.patients?.last_name} · {a.date_str} · {a.services?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label">Monto (S/) *</label>
                <input type="number" step="0.01" min="0" value={form.amount} onChange={upd('amount')} required />
              </div>
              <div className="field">
                <label className="label">Método *</label>
                <select value={form.method} onChange={upd('method')}>
                  {METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="field full">
                <label className="label">Nota</label>
                <input value={form.note} onChange={upd('note')} placeholder="Observaciones del pago..." />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-success" disabled={saving}>{saving ? '⏳' : '✓ Registrar Pago'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Historial de Pagos</div>
        </div>
        {loading ? <div className="loading-center"><div className="spinner" /></div>
        : payments.length === 0 ? (
          <div className="empty"><div className="empty-icon">💸</div><h3>Sin pagos</h3><p>Aún no hay pagos registrados.</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>ID</th><th>Paciente</th><th>Cita</th><th>Monto</th><th>Método</th><th>Fecha</th><th>Nota</th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td><span className="badge badge-gray">#{p.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{p.patients?.first_name} {p.patients?.last_name}</td>
                    <td><Link href={`/citas/${p.appointment_id}`} style={{ color: 'var(--brand)', fontSize: 12 }}>Cita #{p.appointment_id}</Link></td>
                    <td style={{ fontWeight: 700, color: 'var(--green)' }}>S/ {parseFloat(p.amount).toFixed(2)}</td>
                    <td><span className="badge badge-gray">{p.method}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{new Date(p.created_at).toLocaleDateString('es-PE')}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{p.note || '—'}</td>
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
