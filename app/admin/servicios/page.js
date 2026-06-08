'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';

const CATEGORIES = ['Descarga','Evaluación','Terapia','Masaje','Presoterapia','Vendaje','Otro'];
const MODALITIES = ['normal','convenio'];

export default function ServiciosAdminPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', category: 'Descarga', modality: 'normal',
    price_cash: '', price_card: '', active: true
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/services');
    const json = await res.json();
    setServices(json.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const body = { ...form, price_cash: parseFloat(form.price_cash), price_card: parseFloat(form.price_card) };
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (res.ok) { setShowForm(false); setForm({ name: '', category: 'Descarga', modality: 'normal', price_cash: '', price_card: '', active: true }); load(); }
    else setError(json.error || 'Error.');
    setSaving(false);
  };

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Servicios</h1>
          <div className="page-sub">Catálogo de servicios de la clínica</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancelar' : '+ Nuevo Servicio'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 animate-fade">
          <div className="card-header"><div className="card-title">Nuevo Servicio</div></div>
          {error && <div className="alert alert-error mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label className="label">Nombre *</label>
                <input value={form.name} onChange={upd('name')} required />
              </div>
              <div className="field">
                <label className="label">Categoría</label>
                <select value={form.category} onChange={upd('category')}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Modalidad</label>
                <select value={form.modality} onChange={upd('modality')}>
                  {MODALITIES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="field" />
              <div className="field">
                <label className="label">Precio Efectivo (S/)</label>
                <input type="number" step="0.01" min="0" value={form.price_cash} onChange={upd('price_cash')} required />
              </div>
              <div className="field">
                <label className="label">Precio Tarjeta (S/)</label>
                <input type="number" step="0.01" min="0" value={form.price_card} onChange={upd('price_card')} required />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳' : '✓ Guardar'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header"><div className="card-title">Servicios Activos ({services.length})</div></div>
        {loading ? <div className="loading-center"><div className="spinner" /></div>
        : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Modalidad</th><th>Efectivo</th><th>Tarjeta</th></tr></thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id}>
                    <td><span className="badge badge-gray">#{s.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td><span className="badge badge-purple">{s.category}</span></td>
                    <td><span className={`badge ${s.modality === 'normal' ? 'badge-blue' : 'badge-gold'}`}>{s.modality}</span></td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>S/ {s.price_cash}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>S/ {s.price_card}</td>
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
