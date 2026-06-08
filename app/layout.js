import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Centro Eslava | Sistema de Gestión',
  description: 'Sistema de gestión clínica para Centro Eslava. Pacientes, citas, reportes y pagos.',
  keywords: 'centro eslava, fisioterapia, gestión clínica, citas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
