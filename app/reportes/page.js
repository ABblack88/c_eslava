'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

const SECTION_FIELDS = [
  ['motivo_consulta',  'Motivo de consulta'],
  ['anamnesis',        'Anamnesis'],
  ['examen_fisico',    'Examen físico'],
  ['examen_clinico',   'Examen clínico / Diagnóstico'],
  ['plan_tratamiento', 'Plan de tratamiento'],
  ['evolucion',        'Evolución'],
  ['observaciones',    'Observaciones'],
];

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif,image/heic';
const MAX_MB = 10;

/* ── Lightbox ────────────────────────────────── */
function Lightbox({ img, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>✕</button>
        <img src={img.public_url} alt={img.caption || img.file_name} />
        {(img.caption || img.file_name) && (
          <div className="lightbox-caption">{img.caption || img.file_name}</div>
        )}
      </div>
    </div>
  );
}

/* ── Image Uploader ──────────────────────────── */
function ImageUploader({ appointmentId }) {
  const [images, setImages]       = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [dragOver, setDragOver]   = useState(false);
  const [lightbox, setLightbox]   = useState(null);
  const [caption, setCaption]     = useState('');
  const [error, setError]         = useState('');
  const inputRef = useRef();

  const load = useCallback(async () => {
    const res = await fetch(`/api/report-images?appointment_id=${appointmentId}`);
    const json = await res.json();
    setImages(json.data || []);
  }, [appointmentId]);

  useEffect(() => { if (appointmentId) load(); }, [load, appointmentId]);

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes.'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setError(`Tamaño máximo: ${MAX_MB} MB.`); return; }
    setError(''); setUploading(true); setProgress(10);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('appointment_id', appointmentId);
    fd.append('caption', caption);

    // Simular progreso visual
    const timer = setInterval(() => setProgress(p => Math.min(p + 15, 85)), 200);

    const res = await fetch('/api/report-images', { method: 'POST', body: fd });
    clearInterval(timer);

    if (res.ok) {
      setProgress(100);
      setCaption('');
      await load();
      setTimeout(() => { setProgress(0); setUploading(false); }, 600);
    } else {
      const json = await res.json();
      setError(json.error || 'Error al subir imagen.');
      setProgress(0); setUploading(false);
    }
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(f => uploadFile(f));
  };

  const handleDelete = async (img) => {
    if (!confirm(`¿Eliminar "${img.file_name}"?`)) return;
    await fetch(`/api/report-images?id=${img.id}&storage_path=${encodeURIComponent(img.storage_path)}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      {/* Caption opcional */}
      <div className="field" style={{ marginBottom: 10 }}>
        <label className="label" style={{ fontSize: 11 }}>Descripción para la imagen (opcional)</label>
        <input value={caption} onChange={e => setCaption(e.target.value)}
          placeholder="Ej: Radiografía inicial, Zona lumbar..." style={{ fontSize: 12 }} />
      </div>

      {/* Drop zone */}
      <div
        className={`img-drop-zone${dragOver ? ' drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept={ACCEPTED_TYPES} multiple
          onChange={e => handleFiles(e.target.files)} style={{ display:'none' }} />
        <div className="img-drop-icon">{uploading ? '⏳' : '🖼️'}</div>
        <div className="img-drop-label">
          {uploading ? 'Subiendo imagen...' : 'Arrastra imágenes aquí o haz clic para seleccionar'}
        </div>
        <div className="img-drop-sub">JPG, PNG, WEBP, GIF · máx. {MAX_MB} MB por imagen</div>
        {uploading && (
          <div className="img-upload-progress" style={{ marginTop: 12 }}>
            <div className="img-upload-bar" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginTop: 8, fontSize: 12, padding: '8px 12px' }}>{error}</div>
      )}

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 14, marginBottom: 6, fontWeight: 600 }}>
            📎 {images.length} imagen{images.length !== 1 ? 'es' : ''} adjunta{images.length !== 1 ? 's' : ''}
          </div>
          <div className="img-grid">
            {images.map(img => (
              <div key={img.id} className="img-thumb">
                <img src={img.public_url} alt={img.caption || img.file_name}
                  onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333"/><text x="50" y="55" text-anchor="middle" fill="%23888" font-size="12">Error</text></svg>'; }} />
                {img.caption && <div className="img-caption">{img.caption}</div>}
                <div className="img-thumb-overlay">
                  <button className="img-thumb-btn img-thumb-btn-view"
                    onClick={e => { e.stopPropagation(); setLightbox(img); }}>🔍</button>
                  <button className="img-thumb-btn img-thumb-btn-del"
                    onClick={e => { e.stopPropagation(); handleDelete(img); }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lightbox && <Lightbox img={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

/* ── Página Principal ────────────────────────── */
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
      .then(d => { setReport(d.data); setPayload(d.data?.report_text || {}); });
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                <p>Haz clic en una cita de la lista para comenzar.</p>
              </div>
            )}
          </div>

          {/* Panel de imágenes — solo cuando hay cita seleccionada */}
          {current && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">🖼️ Imágenes del Reporte</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  Radiografías, ecografías, fotos clínicas
                </div>
              </div>
              <ImageUploader appointmentId={appointmentId} />
            </div>
          )}
        </div>

        {/* Appointment list */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Citas</div>
            <div className="search-input">
              <span className="search-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" />
                </svg>
              </span>
              <input placeholder="Buscar paciente..." value={q} onChange={e => setQ(e.target.value)} />
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
                    padding: '10px 12px',
                    background: appointmentId == a.id ? 'var(--brand-glow)' : 'var(--bg3)',
                    borderRadius: 8,
                    border: `1px solid ${appointmentId == a.id ? 'var(--brand)' : 'var(--border2)'}`,
                    textDecoration: 'none', transition: 'all .15s',
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
