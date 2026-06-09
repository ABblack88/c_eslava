'use client';
import Link from 'next/link';

export default function Topbar() {
  return (
    <header className="topbar">
      <Link href="/" className="brand" style={{ textDecoration: 'none' }}>
        <div className="brand-emblem">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="url(#brandGrad)" />
            <path d="M7 14C7 10.134 10.134 7 14 7C17.866 7 21 10.134 21 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 18C10 16.343 11.791 15 14 15C16.209 15 18 16.343 18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="14" cy="11.5" r="1.5" fill="white" />
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0896a7" />
                <stop offset="1" stopColor="#05647a" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="brand-text">
          <div className="brand-name">
            <span className="brand-centro">CENTRO</span>
            <span className="brand-eslava">ESLAVA</span>
          </div>
          <div className="brand-sub">SISTEMA DE GESTIÓN</div>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="topbar-version">v4.0</div>
        <div className="status-dot" title="Conectado al servidor" />
      </div>
    </header>
  );
}
