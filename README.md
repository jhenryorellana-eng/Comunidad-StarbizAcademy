# StarbizAcademy — Plataforma de Comunidad

La plataforma del **Ecosistema Familiar**: CEO Junior para adolescentes 14+ y Padres 3.0 para la familia, respaldados por la metodología **GÉNESIS i7™**.

- **Comunidad**: hub con barra lateral y espacios — Inicio (feed), Publicaciones, Eventos (con RSVP), StarVoice (audios), Chat (solo miembros), Miembros, StarBooks (micro-resúmenes de libros) y GÉNESIS i7 (cohortes con progreso semana X/7).
- **Admin**: panel de administración con CRUD de eventos, StarVoice, StarBooks, cohortes y publicaciones.

Marca: **navy profundo (#1a2744) + cyan + estrella dorada**, sobre blanco cálido. Bilingüe (español por defecto).

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | **Next.js 16** (App Router) + **React 19** |
| Estilos | **Tailwind CSS v4** (CSS-first, tokens de marca en `globals.css`) |
| Base de datos | **Prisma 6 + SQLite** (archivo local, migrable a Postgres/Supabase) |
| Auth | JWT propio en cookie httpOnly (`jose`) + `bcryptjs`, roles |
| Mutaciones | Route Handlers (`/api/**`) + **Server Actions** (admin) |
| i18n | Diccionario ES/EN, toggle con cookie (`es` por defecto) |
| Tiempo real | Chat por polling (cada 3s) |

## Cómo correrlo

Requisitos: Node.js ≥ 18.18 (probado en 22).

```bash
npm install
npx prisma db push          # crea la base SQLite (dev.db)
npm run db:seed             # carga datos de demo (Cohorte Provo, eventos, StarVoice, etc.)
npm run dev                 # http://localhost:3000
```

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
/login  /signup           Auth (registro como Joven·CEO Junior o Padre/Madre·Padres 3.0)

/community                Inicio (resumen del feed)
/community/posts          Muro: publicar, comentar, reaccionar
/community/events         Eventos por mes + destacado + RSVP
/community/podcast        StarVoice — biblioteca de audios
/community/chat           Chat en vivo (SOLO miembros)
/community/members        Directorio
/community/observatory    StarBooks — micro-resúmenes de libros
/community/chapters       Cohortes GÉNESIS i7 con progreso (semana X/7)

/admin/**                 Panel de administración (rol ADMIN)
```

## GÉNESIS i7™ — las 7 inteligencias

Una por semana, en este orden: **i1 Espiritual · i2 Mental · i3 Física · i4 Emocional · i5 Social · i6 Financiera · i7 Tecnológica**. Definidas en `src/lib/constants.ts` (`INTELLIGENCES`).

## i18n

Español es el idioma por defecto. Todas las cadenas de UI viven en `src/lib/i18n/dictionaries.ts` (`es` / `en`); el toggle ES/EN guarda la preferencia en cookie y el servidor re-renderiza.

## Migrar a Postgres/Supabase (producción)

El esquema evita enums nativos y JSON para que la migración sea directa:

1. En `prisma/schema.prisma` cambiar `provider = "sqlite"` por `postgresql` y agregar `directUrl = env("DIRECT_URL")`.
2. Definir `DATABASE_URL` (pooled, puerto 6543 + `?pgbouncer=true&connection_limit=1`) y `DIRECT_URL` (directa, puerto 5432) en `.env`.
3. `npx prisma migrate dev` (o `db push`) y `npm run db:seed`.
4. Configurar `JWT_SECRET`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` en el entorno de producción.
5. En Supabase, habilitar RLS en todas las tablas (la app conecta vía Prisma con el rol de Postgres, así que RLS sin políticas bloquea la Data API pública sin afectar la app).

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
