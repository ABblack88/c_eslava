import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';
import '@/app/globals.css';

export default function AppLayout({ children }) {
  return (
    <>
      <Topbar />
      <div className="shell">
        <Sidebar />
        <main className="main animate-fade">{children}</main>
      </div>
    </>
  );
}
