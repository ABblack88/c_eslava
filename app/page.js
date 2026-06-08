import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Nav */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">CE</div>
          <div>
            <div className="brand-name">Centro Eslava</div>
            <div className="brand-sub">Sistema de Gestión</div>
          </div>
        </div>
        <Link href="/dashboard" className="btn btn-primary">
          Abrir Sistema →
        </Link>
      </header>

      {/* Hero */}
      <section className="hero" style={{ marginTop: 60 }}>
        <div>
          <div className="hero-badge">✨ Versión 4.0 — Ahora en la nube</div>
          <h1>
            Gestiona tu clínica<br />
            <span>sin límites</span>
          </h1>
          <p>
            Pacientes, citas, reportes clínicos y pagos — todo desde el navegador,
            en tiempo real, desde cualquier dispositivo.
          </p>
          <div className="hero-actions">
            <Link href="/dashboard" className="btn btn-primary">
              📊 Ir al Dashboard
            </Link>
            <Link href="/pacientes" className="btn btn-ghost">
              👤 Ver Pacientes
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        {[
          { icon: '👤', title: 'Gestión de Pacientes', desc: 'Registro clínico completo: datos personales, medicación, patologías, cirugías y notas.' },
          { icon: '📅', title: 'Agenda de Citas', desc: 'Programa citas con servicio, horario y estado. Edita y actualiza en segundos.' },
          { icon: '📋', title: 'Reportes Clínicos', desc: 'Notas estructuradas por cita con soporte para imágenes de examen clínico.' },
          { icon: '💰', title: 'Control de Pagos', desc: 'Registra cobros en efectivo o tarjeta con cálculo automático de IGV.' },
          { icon: '⚙️', title: 'Catálogo de Servicios', desc: 'Administra servicios con precios diferenciados por modalidad (normal / convenio).' },
          { icon: '☁️', title: 'En la Nube', desc: 'Base de datos en Supabase PostgreSQL. Accede desde cualquier PC de la clínica.' },
        ].map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
