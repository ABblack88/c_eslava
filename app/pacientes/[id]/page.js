'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const STATUS_BADGE = { 'Programada':'badge-blue','Confirmada':'badge-purple','Completada':'badge-green','Cancelada':'badge-red','No asistió':'badge-gray' };
const ENTRY_TYPES = [
  { value: 'inicial',     label: '📋 Inicial',      color: '#3b82f6' },
  { value: 'antecedente', label: '⚕️ Antecedente',   color: '#f59e0b' },
  { value: 'evolucion',   label: '📈 Evolución',     color: '#10b981' },
  { value: 'observacion', label: '💬 Observación',   color: '#8b5cf6' },
];
function getEntryMeta(type) { return ENTRY_TYPES.find(t => t.value === type) || { label: type, color: 'var(--text3)' }; }

/* ── Componente Historia Clínica ─────────────────── */
function TabHistoriaClinica({ patientId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    entry_type: 'inicial', entry_date: new Date().toISOString().split('T')[0],
    title: '', content: '', created_by: 'Sistema',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/clinical-history?patient_id=${patientId}`);
    const json = await res.json();
    setEntries(json.data || []);
    setLoading(false);
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    const body = { ...form, patient_id: parseInt(patientId) };
    const res = await fetch('/api/clinical-history', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const json = await res.json();
    if (res.ok) {
      setShowForm(false);
      setForm({ entry_type:'inicial', entry_date: new Date().toISOString().split('T')[0], title:'', content:'', created_by:'Sistema' });
      load();
    } else { setError(json.error || 'Error al guardar.'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta entrada?')) return;
    await fetch(`/api/clinical-history?id=${id}`, { method: 'DELETE' });
    load();
  };

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="settings-section-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="settings-section-title">Historia Clínica</div>
          <div className="settings-section-sub">{entries.length} registro{entries.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancelar' : '+ Nueva Entrada'}
        </button>
      </div>

      {/* Leyenda de tipos */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {ENTRY_TYPES.map(t => (
          <span key={t.value} style={{
            fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20,
            background: t.color + '22', color: t.color, border: `1px solid ${t.color}44`
          }}>{t.label}</span>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card mb-4" style={{ borderColor: 'var(--brand)', boxShadow: '0 0 0 1px var(--brand-glow)' }}>
          <div className="card-header"><div className="card-title">Nueva Entrada Clínica</div></div>
          {error && <div className="alert alert-error mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label className="label">Tipo de entrada *</label>
                <select value={form.entry_type} onChange={upd('entry_type')}>
                  {ENTRY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Fecha</label>
                <input type="date" value={form.entry_date} onChange={upd('entry_date')} />
              </div>
              <div className="field full">
                <label className="label">Título / Diagnóstico *</label>
                <input value={form.title} onChange={upd('title')} placeholder="Ej: Lumbalgia crónica, Antecedente quirúrgico..." required />
              </div>
              <div className="field full">
                <label className="label">Descripción detallada *</label>
                <textarea value={form.content} onChange={upd('content')} rows={4}
                  placeholder="Describe síntomas, tratamiento, evolución o antecedente con todos los detalles relevantes..." required />
              </div>
              <div className="field">
                <label className="label">Registrado por</label>
                <input value={form.created_by} onChange={upd('created_by')} placeholder="Nombre del terapeuta..." />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳' : '✓ Guardar Entrada'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Timeline de entradas */}
      {loading ? <div className="loading-center"><div className="spinner" /></div>
      : entries.length === 0 ? (
        <div className="empty" style={{ padding: 40 }}>
          <div className="empty-icon">📋</div>
          <h3>Sin historial clínico</h3>
          <p>Crea la primera entrada para este paciente.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map(entry => {
            const meta = getEntryMeta(entry.entry_type);
            return (
              <div key={entry.id} style={{
                display: 'flex', gap: 14,
                padding: '14px 16px',
                background: 'var(--bg3)', borderRadius: 10,
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${meta.color}`,
              }}>
                {/* Indicador de tipo */}
                <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 60 }}>
                  <div style={{
                    fontSize: 18, background: meta.color + '22',
                    borderRadius: 8, padding: '6px 8px', display: 'inline-block', marginBottom: 4,
                  }}>{meta.label.split(' ')[0]}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.3 }}>
                    {new Date(entry.entry_date + 'T12:00').toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'2-digit' })}
                  </div>
                </div>
                {/* Contenido */}
                <div style={{ flex: 1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{entry.title}</span>
                      {entry.appointment_id && (
                        <Link href={`/citas/${entry.appointment_id}`}
                          style={{ fontSize:11, color:'var(--brand)', marginLeft:8, textDecoration:'none' }}>
                          📅 Cita #{entry.appointment_id}
                        </Link>
                      )}
                    </div>
                    <button onClick={() => handleDelete(entry.id)}
                      style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:14, padding:'0 4px' }}
                      title="Eliminar">✕</button>
                  </div>
                  <p style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6, whiteSpace:'pre-wrap', margin:0 }}>
                    {entry.content}
                  </p>
                  {entry.created_by && (
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>
                      Por: {entry.created_by}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Página Principal ────────────────────────────── */
export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('datos'); // 'datos' | 'historia' | 'citas'

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then(r => r.json())
      .then(d => { setPatient(d.data); setForm(d.data); setAppointments(d.appointments || []); setLoading(false); });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/patients/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    if (res.ok) { const d = await res.json(); setPatient(d.data); setEditing(false); }
    setSaving(false);
  };

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (loading) return <AppShell><div className="loading-center"><div className="spinner" /></div></AppShell>;
  if (!patient) return <AppShell><div className="empty"><h3>Paciente no encontrado</h3></div></AppShell>;

  const fields = [
    ['document','Documento'], ['birth_date','Nacimiento'], ['contact','Teléfono'],
    ['email','Email'], ['profession','Profesión'], ['medication','Medicación'],
    ['pathology','Patología'], ['surgeries','Cirugías'],
  ];

  const tabs = [
    { id: 'datos',   label: '👤 Datos',          count: null },
    { id: 'historia',label: '📋 Historia Clínica', count: null },
    { id: 'citas',   label: '📅 Citas',           count: appointments.length },
  ];

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <Link href="/pacientes" style={{ color:'var(--text2)', fontSize:13, textDecoration:'none' }}>← Pacientes</Link>
          <h1 className="page-title" style={{ marginTop:4 }}>{patient.first_name} {patient.last_name}</h1>
          <div className="page-sub">ID #{patient.id}</div>
        </div>
        <div className="flex gap-2">
          {activeTab === 'datos' && (
            editing
              ? <>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳' : '✓ Guardar'}</button>
                  <button className="btn btn-ghost" onClick={() => { setEditing(false); setForm(patient); }}>Cancelar</button>
                </>
              : <button className="btn btn-ghost" onClick={() => setEditing(true)}>✏️ Editar</button>
          )}
          <Link href={`/citas?patient_id=${patient.id}`} className="btn btn-primary">+ Nueva Cita</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs" style={{ marginBottom: 24 }}>
        {tabs.map(tab => (
          <button key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="badge badge-gray" style={{ marginLeft:6, fontSize:10 }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* TAB: Datos */}
      {activeTab === 'datos' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Datos del Paciente</div></div>
          <div className="form-grid">
            {editing ? (
              <>
                {[['first_name','Nombres'],['last_name','Apellidos'], ...fields].map(([k,l]) => (
                  <div className="field" key={k}>
                    <label className="label">{l}</label>
                    <input value={form[k] || ''} onChange={upd(k)} />
                  </div>
                ))}
                <div className="field full">
                  <label className="label">Notas</label>
                  <textarea value={form.notes || ''} onChange={upd('notes')} rows={3} />
                </div>
              </>
            ) : (
              <>
                {fields.map(([k,l]) => (
                  <div key={k}>
                    <div className="info-label">{l}</div>
                    <div className="info-value">{patient[k] || '—'}</div>
                  </div>
                ))}
                {patient.notes && (
                  <div className="full">
                    <div className="info-label">Notas</div>
                    <div className="info-value" style={{ fontWeight:400 }}>{patient.notes}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB: Historia Clínica */}
      {activeTab === 'historia' && (
        <div className="card">
          <TabHistoriaClinica patientId={id} />
        </div>
      )}

      {/* TAB: Citas */}
      {activeTab === 'citas' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Historial de Citas</div>
            <span className="badge badge-gray">{appointments.length}</span>
          </div>
          {appointments.length === 0 ? (
            <div className="empty" style={{ padding:32 }}>
              <div className="empty-icon">📅</div>
              <p>Sin citas registradas</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {appointments.map(a => (
                <div key={a.id} style={{
                  padding:'10px 12px', background:'var(--bg3)',
                  borderRadius:8, border:'1px solid var(--border2)',
                  display:'flex', justifyContent:'space-between', alignItems:'center'
                }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13 }}>{a.services?.name}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{a.date_str} · {a.time_str}</div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span className={`badge ${STATUS_BADGE[a.status]||'badge-gray'}`}>{a.status}</span>
                    <Link href={`/citas/${a.id}`} className="btn btn-ghost btn-sm">Ver</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
