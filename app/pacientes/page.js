'use client';
import { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

export default function PacientesPage() {
  const [patients, setPatients] = useState([]);
  const [count, setCount] = useState(0);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    first_name: '', last_name: '', document: '', birth_date: '',
    contact: '', email: '', profession: '', medication: '',
    pathology: '', surgeries: '', notes: ''
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/patients?q=${encodeURIComponent(q)}&limit=50`);
    const json = await res.json();
    setPatients(json.data || []);
    setCount(json.count || 0);
    setLoading(false);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (res.ok) {
      setSuccess('Paciente registrado correctamente.');
      setForm({ first_name: '', last_name: '', document: '', birth_date: '',
        contact: '', email: '', profession: '', medication: '',
        pathology: '', surgeries: '', notes: '' });
      setShowForm(false);
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
          <h1 className="page-title">👤 Pacientes</h1>
          <div className="page-sub">{count} registros</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancelar' : '+ Nuevo Paciente'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-4 animate-fade">
          <div className="card-header">
            <div className="card-title">Nuevo Paciente</div>
          </div>
          {error && <div className="alert alert-error mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {[['first_name','Nombres *'],['last_name','Apellidos *'],['document','Documento'],
                ['birth_date','Fecha de nacimiento'],['contact','Teléfono'],['email','Email'],
                ['profession','Profesión'],['medication','Medicación'],
                ['pathology','Patología'],['surgeries','Cirugías']].map(([k,l]) => (
                <div className="field" key={k}>
                  <label className="label">{l}</label>
                  <input value={form[k]} onChange={upd(k)} required={k.endsWith('*') || ['first_name','last_name'].includes(k)} />
                </div>
              ))}
              <div className="field full">
                <label className="label">Notas adicionales</label>
                <textarea value={form.notes} onChange={upd('notes')} rows={3} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '⏳ Guardando...' : '✓ Guardar Paciente'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {success && <div className="alert alert-success mb-4 animate-fade">{success}</div>}

      {/* Search + Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Lista de Pacientes</div>
          <div className="search-bar">
            <div className="search-input">
              <span className="search-icon"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" /></svg></span>
              <input placeholder="Buscar por nombre o documento..." value={q} onChange={e => setQ(e.target.value)} />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : patients.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👥</div>
            <h3>Sin resultados</h3>
            <p>{q ? `No se encontraron pacientes con "${q}"` : 'Aún no hay pacientes registrados.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Documento</th>
                  <th>Teléfono</th><th>Patología</th><th></th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td><span className="badge badge-gray">#{p.id}</span></td>
                    <td><span style={{ fontWeight: 600 }}>{p.first_name} {p.last_name}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{p.document || '—'}</td>
                    <td style={{ color: 'var(--text2)' }}>{p.contact || '—'}</td>
                    <td style={{ color: 'var(--text2)' }}>{p.pathology || '—'}</td>
                    <td>
                      <Link href={`/pacientes/${p.id}`} className="btn btn-ghost btn-sm">Ver →</Link>
                    </td>
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
