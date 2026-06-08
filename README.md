# Centro Eslava V4.0 — Sistema de Gestión Clínica Web

Sistema fullstack de gestión para Centro Eslava, migrado de Python/Flask/SQLite a **Next.js + Supabase PostgreSQL**.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | Next.js API Routes |
| Base de datos | Supabase (PostgreSQL) |
| Estilos | CSS Vanilla (dark mode premium) |

## Módulos

- 📊 **Dashboard** — resumen del día, estadísticas, citas de hoy
- 👤 **Pacientes** — registro clínico completo, búsqueda, historial
- 📅 **Citas** — agendamiento, edición, filtros por estado
- 📋 **Reportes Clínicos** — notas estructuradas por cita (7 secciones)
- 💰 **Pagos** — registro con autocompletado de monto por servicio
- ⚙️ **Servicios** — catálogo con precios diferenciados

## Variables de entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yldzsnkyqtjgwuiygxfu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key>
```

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Estructura del proyecto

```
app/
  page.js               # Landing page
  dashboard/page.js     # Dashboard
  pacientes/page.js     # Lista de pacientes
  pacientes/[id]/page.js
  citas/page.js         # Lista de citas
  citas/[id]/page.js
  reportes/page.js      # Reportes clínicos
  pagos/page.js         # Pagos
  admin/servicios/page.js
  api/                  # API Routes (backend)
    dashboard/route.js
    patients/route.js
    appointments/route.js
    reports/route.js
    payments/route.js
    services/route.js
components/
  Topbar.jsx
  Sidebar.jsx
  AppShell.jsx
lib/
  supabase.js
```

## Migración de datos

Los 12 servicios del sistema original están precargados en Supabase.
Para migrar pacientes y citas del SQLite anterior, usar el script de migración (pendiente).
