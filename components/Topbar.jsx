'use client';
import Link from 'next/link';

export default function Topbar() {
  return (
    <header className="topbar">
      <Link href="/" className="brand" style={{ textDecoration: 'none' }}>
        <div className="brand-logo">CE</div>
        <div>
          <div className="brand-name">Centro Eslava</div>
          <div className="brand-sub">Sistema de Gestión</div>
        </div>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>v4.0</span>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
          boxShadow: '0 0 6px var(--green)'
        }} title="Conectado" />
      </div>
    </header>
  );
}
