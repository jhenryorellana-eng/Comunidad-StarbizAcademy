# StarbizAcademy — Plataforma de Comunidad

La plataforma del **Ecosistema Familiar**: CEO Junior para adolescentes 14+ y Padres 3.0 para la familia, respaldados por la metodología **GÉNESIS i7™**.

- **Comunidad** (`/comunidad`): Posts (con el tipo estructurado "Mi primera venta", videos de YouTube/Vimeo embebidos y botón Compartir), Miembros (tarjeta de 4 campos con privacidad obligatoria), Eventos (Registrarme + estados En vivo/Pasado con grabación), Blogs (grid editorial con SEO), Podcast (StarVoice con reproductor persistente), Reglas (los 5 no negociables), Tienda y Chat (solo miembros).
- **Confianza**: botón de reporte en cada post y perfil, **registro parental** (el padre/tutor se registra y crea las cuentas de sus CEO Junior en `/familia`, con fecha de nacimiento validada <18 en el servidor), apellidos truncados en backend, sin mensajes privados.
- **Admin**: CRUD de eventos, StarVoice, Blogs, cohortes, publicaciones, tienda y reportes.

Marca: **navy profundo (#1a2744) + cyan + estrella dorada**, sobre blanco cálido. Bilingüe (español por defecto).

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | **Next.js 16** (App Router) + **React 19** |
| Estilos | **Tailwind CSS v4** (CSS-first, tokens de marca en `globals.css`) |
| Base de datos | **Prisma 6 + PostgreSQL (Supabase)** |
| Auth | JWT propio en cookie httpOnly (`jose`) + `bcryptjs`, roles |
| Mutaciones | Route Handlers (`/api/**`) + **Server Actions** (admin) |
| i18n | Diccionario ES/EN, toggle con cookie (`es` por defecto) |
| Tiempo real | Chat por polling (cada 3s) |

## Cómo correrlo

Requisitos: Node.js ≥ 18.18 (probado en 22).

```bash
npm install
cp .env.example .env        # completa DATABASE_URL / DIRECT_URL / JWT_SECRET
npm run dev                 # http://localhost:3000
```

La base de producción (Supabase, proyecto `pduqjkdoxocdrbhounen`) ya tiene el esquema y los datos demo aplicados. Para una base nueva: `npx prisma db push && npm run db:seed`.

Scripts útiles: `npm run typecheck`, `npm run db:reset` (resetea el esquema; re-siembra con `npm run db:seed`).

## Cuentas de demo (del seed)

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | `admin@starbizacademy.com` | `starbiz123` |
| CEO Junior (joven) | `mateo@example.com` | `password123` |
| Padres 3.0 | `roberto@example.com` | `password123` |
| Mentora | `ana@example.com` | `password123` |

- **Admin** → `/admin` (CRUD de eventos, StarVoice, cohortes, StarBooks, publicaciones).
- **Miembro/Padre/Mentor** → desbloquea el **Chat**, RSVP a eventos, y publicar/comentar/reaccionar en el feed.

## Mapa de la plataforma

```
/                         Landing — hero + pilares CEO Junior / Padres 3.0 + GÉNESIS i7™
/login  /signup           Auth — el signup crea SOLO cuentas de padre/tutor
/familia                  Mi familia — el padre da de alta a sus CEO Junior (menores de 18)

/comunidad                → redirige a Posts (actividad primero)
/comunidad/posts          Feed: composer fijo (texto + video), filtros, compartir
/comunidad/posts/[id]     Detalle de un post — destino de los enlaces compartidos
/comunidad/miembros       Directorio: 4 campos públicos, filtros país/recién llegados
/comunidad/eventos        Lista cronológica: Registrarme, En vivo, grabaciones
/comunidad/blogs          Grid editorial + artículo con SEO (/comunidad/blogs/[slug])
/comunidad/podcast        StarVoice — reproductor persistente al pie
/comunidad/reglas         Los 5 no negociables (infraestructura de confianza)
/comunidad/tienda         Apps y servicios (CTA WhatsApp)
/comunidad/chat           Canales visibles (SOLO miembros — sin mensajes privados)

/admin/**                 Panel de administración (rol ADMIN)
```

Las rutas viejas `/community/*` y `/store` redirigen permanentemente a las nuevas.

## GÉNESIS i7™ — las 7 inteligencias

Una por semana, en este orden: **i1 Espiritual · i2 Mental · i3 Física · i4 Emocional · i5 Social · i6 Financiera · i7 Tecnológica**. Definidas en `src/lib/constants.ts` (`INTELLIGENCES`).

## i18n

Español es el idioma por defecto. Todas las cadenas de UI viven en `src/lib/i18n/dictionaries.ts` (`es` / `en`); el toggle ES/EN guarda la preferencia en cookie y el servidor re-renderiza.

## Base de datos (Supabase)

Proyecto: **pduqjkdoxocdrbhounen** (https://pduqjkdoxocdrbhounen.supabase.co, sa-east-1). El esquema está aplicado con **RLS habilitado** en todas las tablas (la app conecta vía Prisma con el rol de Postgres; la Data API pública queda cerrada). Las cadenas de conexión salen del dashboard: **Connect → ORMs → Prisma**.

## Deploy en Vercel

- vercel.com → **Add New → Project** → importar el repo de GitHub.
- Framework: **Next.js** (auto-detectado). El build command queda `npm run build` (`prisma generate && next build`).
- Variables de entorno: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `AUTH_COOKIE_NAME=sba_session` (Production + Preview).

## Estructura

```
prisma/            schema.prisma · seed.ts
src/app/           landing, (auth), community/**, admin/**, api/**
src/components/    ui.tsx, Star (logo/motivo), SiteHeader/Footer, community/**, admin/**
src/lib/           prisma, auth, constants, format, i18n/**
src/proxy.ts       gating de rutas (admin)
```
