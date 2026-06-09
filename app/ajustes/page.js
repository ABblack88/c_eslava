'use client';
import { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/AppShell';

const ROLES = [
  { value: 'developer', label: 'Desarrollador', color: 'badge-red', desc: 'Acceso total al sistema' },
  { value: 'admin',     label: 'Administrador', color: 'badge-gold', desc: 'Gestión clínica completa' },
  { value: 'basic',     label: 'Usuario Básico', color: 'badge-green', desc: 'Solo lectura y citas' },
];
const CATEGORIES = ['Descarga','Evaluación','Terapia','Masaje','Presoterapia','Vendaje','Otro'];
const MODALITIES = ['normal','convenio'];

function getRoleMeta(role) {
  return ROLES.find(r => r.value === role) || { label: role, color: 'badge-gray' };
}

/* ────────────────────────────────────────────── */
/*  TAB: USUARIOS                                 */
/* ────────────────────────────────────────────── */
function TabUsuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', role: 'basic', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/system-users');
    const json = await res.json();
    setUsers(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch('/api/system-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (res.ok) {
      setShowForm(false);
      setForm({ full_name: '', email: '', role: 'basic', notes: '' });
      load();
    } else {
      setError(json.error || 'Error al guardar.');
    }
    setSaving(false);
  };

  const toggleActive = async (user) => {
    await fetch('/api/system-users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, active: !user.active }),
    });
    load();
  };

  const deleteUser = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    await fetch(`/api/system-users?id=${id}`, { method: 'DELETE' });
    load();
  };

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="settings-section-header">
        <div>
          <div className="settings-section-title">Gestión de Usuarios</div>
          <div className="settings-section-sub">Administra los accesos al sistema y sus jerarquías</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {/* Roles info cards */}
      <div className="roles-grid">
        {ROLES.map(r => (
          <div key={r.value} className={`role-card role-${r.value}`}>
            <div className="role-icon">{r.value === 'developer' ? '🔴' : r.value === 'admin' ? '🟡' : '🟢'}</div>
            <div className="role-name">{r.label}</div>
            <div className="role-desc">{r.desc}</div>
            <div className="role-count">{users.filter(u => u.role === r.value).length} usuario(s)</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card mb-4 animate-fade">
          <div className="card-header"><div className="card-title">Agregar Usuario</div></div>
          {error && <div className="alert alert-error mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label className="label">Nombre completo *</label>
                <input value={form.full_name} onChange={upd('full_name')} placeholder="Ej: María García" required />
              </div>
              <div className="field">
                <label className="label">Correo electrónico *</label>
                <input type="email" value={form.email} onChange={upd('email')} placeholder="usuario@centroeslava.pe" required />
              </div>
              <div className="field">
                <label className="label">Rol del sistema *</label>
                <select value={form.role} onChange={upd('role')}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Notas (opcional)</label>
                <input value={form.notes} onChange={upd('notes')} placeholder="Cargo, área, etc." />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳' : '✓ Crear Usuario'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header"><div className="card-title">Usuarios del Sistema ({users.length})</div></div>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th>Desde</th><th>Acciones</th></tr></thead>
              <tbody>
                {users.map(u => {
                  const meta = getRoleMeta(u.role);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="user-avatar-row">
                          <div className={`user-avatar role-avatar-${u.role}`}>{u.full_name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.full_name}</div>
                            {u.notes && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.notes}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text2)' }}>{u.email}</td>
                      <td><span className={`badge ${meta.color}`}>{meta.label}</span></td>
                      <td>
                        <button
                          className={`toggle-switch ${u.active ? 'on' : 'off'}`}
                          onClick={() => toggleActive(u)}
                          title={u.active ? 'Desactivar' : 'Activar'}
                        >
                          <span className="toggle-knob" />
                          <span className="toggle-label">{u.active ? 'Activo' : 'Inactivo'}</span>
                        </button>
                      </td>
                      <td style={{ color: 'var(--text3)', fontSize: 12 }}>
                        {new Date(u.created_at).toLocaleDateString('es-PE')}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm btn-danger-ghost" onClick={() => deleteUser(u.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── */
/*  TAB: SERVICIOS                                */
/* ────────────────────────────────────────────── */
function TabServicios() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editField, setEditField] = useState({});
  const [filterCat, setFilterCat] = useState('');

  const [form, setForm] = useState({
    name: '', category: 'Descarga', modality: 'normal',
    price_cash: '', price_card: '', active: true
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/services?all=1');
    const json = await res.json();
    setServices(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

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
    if (res.ok) {
      setShowForm(false);
      setForm({ name: '', category: 'Descarga', modality: 'normal', price_cash: '', price_card: '', active: true });
      load();
    } else setError(json.error || 'Error.');
    setSaving(false);
  };

  const patchService = async (id, fields) => {
    await fetch('/api/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...fields }),
    });
    load();
  };

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const filtered = filterCat ? services.filter(s => s.category === filterCat) : services;

  return (
    <div>
      <div className="settings-section-header">
        <div>
          <div className="settings-section-title">Catálogo de Servicios</div>
          <div className="settings-section-sub">Edita precios y habilita o deshabilita servicios</div>
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
        <div className="card-header">
          <div className="card-title">
            Servicios ({filtered.length})
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>
              {services.filter(s => s.active !== false).length} activos
            </span>
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ padding: '6px 10px', fontSize: 12, borderRadius: 6, width: 'auto' }}>
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Nombre</th><th>Categoría</th><th>Modalidad</th><th>Efectivo (S/)</th><th>Tarjeta (S/)</th><th>Estado</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ opacity: s.active === false ? 0.45 : 1 }}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td><span className="badge badge-purple">{s.category}</span></td>
                    <td><span className={`badge ${s.modality === 'normal' ? 'badge-blue' : 'badge-gold'}`}>{s.modality}</span></td>
                    <td>
                      {editId === s.id && editField.field === 'price_cash' ? (
                        <div className="inline-edit">
                          <input type="number" step="0.01" min="0"
                            defaultValue={s.price_cash}
                            style={{ width: 90, padding: '4px 8px' }}
                            autoFocus
                            onBlur={async e => {
                              await patchService(s.id, { price_cash: parseFloat(e.target.value) });
                              setEditId(null);
                            }}
                            onKeyDown={e => { if (e.key === 'Escape') setEditId(null); }}
                          />
                        </div>
                      ) : (
                        <span className="price-cell" onClick={() => { setEditId(s.id); setEditField({ field: 'price_cash' }); }}>
                          <span style={{ color: 'var(--green)', fontWeight: 600 }}>S/ {s.price_cash}</span>
                          <span className="edit-hint">✏️</span>
                        </span>
                      )}
                    </td>
                    <td>
                      {editId === s.id && editField.field === 'price_card' ? (
                        <div className="inline-edit">
                          <input type="number" step="0.01" min="0"
                            defaultValue={s.price_card}
                            style={{ width: 90, padding: '4px 8px' }}
                            autoFocus
                            onBlur={async e => {
                              await patchService(s.id, { price_card: parseFloat(e.target.value) });
                              setEditId(null);
                            }}
                            onKeyDown={e => { if (e.key === 'Escape') setEditId(null); }}
                          />
                        </div>
                      ) : (
                        <span className="price-cell" onClick={() => { setEditId(s.id); setEditField({ field: 'price_card' }); }}>
                          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>S/ {s.price_card}</span>
                          <span className="edit-hint">✏️</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`toggle-switch ${s.active !== false ? 'on' : 'off'}`}
                        onClick={() => patchService(s.id, { active: s.active === false })}
                      >
                        <span className="toggle-knob" />
                        <span className="toggle-label">{s.active !== false ? 'Activo' : 'Inactivo'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── */
/*  TAB: CONFIGURACIÓN GENERAL                   */
/* ────────────────────────────────────────────── */
function TabGeneral() {
  return (
    <div className="card">
      <div className="card-header"><div className="card-title">⚙️ Configuración General</div></div>
      <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text2)' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🛠️</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>En construcción</div>
        <div style={{ fontSize: 13 }}>Configuración de la clínica, horarios, notificaciones — próximamente.</div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── */
/*  PÁGINA PRINCIPAL                             */
/* ────────────────────────────────────────────── */
const TABS = [
  { key: 'usuarios', label: 'Usuarios', icon: '👥' },
  { key: 'servicios', label: 'Servicios', icon: '🏷️' },
  { key: 'general', label: 'General', icon: '⚙️' },
];

export default function AjustesPage() {
  const [tab, setTab] = useState('usuarios');

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Ajustes del Sistema</h1>
          <div className="page-sub">Usuarios, servicios y configuración del Centro Eslava</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`settings-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div className="settings-content animate-fade" key={tab}>
        {tab === 'usuarios' && <TabUsuarios />}
        {tab === 'servicios' && <TabServicios />}
        {tab === 'general' && <TabGeneral />}
      </div>
    </AppShell>
  );
}
