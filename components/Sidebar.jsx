'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/pacientes', label: 'Pacientes', icon: '👤' },
  { href: '/citas', label: 'Citas', icon: '📅' },
  { href: '/reportes', label: 'Reportes', icon: '📋' },
  { href: '/pagos', label: 'Pagos', icon: '💰' },
  { href: '/admin/servicios', label: 'Servicios', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-section">Menú</div>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`sidebar-link ${pathname.startsWith(item.href) ? 'active' : ''}`}
        >
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
