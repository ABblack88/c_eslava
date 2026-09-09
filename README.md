# 🏥 Centro Eslava - App Next.js + Supabase

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](#)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?style=for-the-badge&logo=supabase)](#)

Aplicación web moderna para la gestión del Centro Eslava. Construida con una arquitectura Full-Stack Serverless de vanguardia, empleando el poder de Next.js para el renderizado y Supabase como Backend-as-a-Service (BaaS).

## 🚀 Arquitectura y Tecnologías Clave

Este repositorio contiene la evolución tecnológica de la plataforma, separando claramente la lógica de negocio y la persistencia de datos:

- **Frontend Reactivo:** Renderizado mediante **Next.js** y **React 19**, permitiendo interfaces ultrarrápidas y componentes de última generación.
- **Backend Serverless (Supabase):** Integración nativa con `@supabase/supabase-js` para autenticación, base de datos PostgreSQL en tiempo real y almacenamiento.
- **Calidad de Código:** Configuración estricta de `ESLint` para Next.js, asegurando convenciones sólidas y código limpio en todo el proyecto.

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16
- **Librería UI:** React 19
- **BaaS & Auth:** Supabase
- **Linting:** ESLint

## 📦 Despliegue y Desarrollo Local

Para levantar este proyecto en tu entorno local:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev
```

> **Nota:** Se requiere configurar las variables de entorno locales `.env.local` con las claves públicas de Supabase (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`) para el correcto funcionamiento de las conexiones a la base de datos.
