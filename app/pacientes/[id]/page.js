'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const STATUS_BADGE = { 'Programada':'badge-blue','Confirmada':'badge-purple','Completada':'badge-green','Cancelada':'badge-red','No asistió':'badge-gray' };

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then(r => r.json())
      .then(d => {
        setPatient(d.data);
        setForm(d.data);
        setAppointments(d.appointments || []);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const d = await res.json();
      setPatient(d.data);
      setEditing(false);
    }
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

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <Link href="/pacientes" style={{ color: 'var(--text2)', fontSize: 13, textDecoration: 'none' }}>← Pacientes</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>{patient.first_name} {patient.last_name}</h1>
          <div className="page-sub">ID #{patient.id}</div>
        </div>
        <div className="flex gap-2">
          {editing
            ? <>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳' : '✓ Guardar'}</button>
                <button className="btn btn-ghost" onClick={() => { setEditing(false); setForm(patient); }}>Cancelar</button>
              </>
            : <button className="btn btn-ghost" onClick={() => setEditing(true)}>✏️ Editar</button>
          }
          <Link href={`/citas/nueva?patient_id=${patient.id}`} className="btn btn-primary">+ Nueva Cita</Link>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        {/* Datos del paciente */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Datos del Paciente</div>
          </div>
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
                    <div className="info-value" style={{ fontWeight: 400 }}>{patient.notes}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Historial de citas */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Historial de Citas</div>
            <span className="badge badge-gray">{appointments.length}</span>
          </div>
          {appointments.length === 0 ? (
            <div className="empty" style={{ padding: 32 }}>
              <div className="empty-icon">📅</div>
              <p>Sin citas registradas</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {appointments.map(a => (
                <div key={a.id} style={{
                  padding: '10px 12px', background: 'var(--bg3)',
                  borderRadius: 8, border: '1px solid var(--border2)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.services?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                      {a.date_str} · {a.time_str}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge ${STATUS_BADGE[a.status] || 'badge-gray'}`}>{a.status}</span>
                    <Link href={`/citas/${a.id}`} className="btn btn-ghost btn-sm">Ver</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
