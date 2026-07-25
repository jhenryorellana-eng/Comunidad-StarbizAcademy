import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

/* ===========================================================================
   Datos compartidos de la comunidad, cacheados.

   Por qué existe este archivo: la base vive en Supabase sa-east-1 y una ida y
   vuelta medida cuesta ~518 ms. Peor aún, la cadena de conexión trae
   `connection_limit=1`, así que un `Promise.all` NO paraleliza: las consultas
   hacen cola en una única conexión (medido: 5 count() tardan lo mismo en
   paralelo, 2588 ms, que en serie, 2593 ms).

   El layout de comunidad pedía 5 contadores y la columna derecha 2-3 consultas
   más EN CADA NAVEGACIÓN. Son datos agregados y públicos que cambian despacio:
   cachearlos 60 s quita ~7 viajes por carga sin que el usuario note nada.

   No entra aquí nada dependiente de la sesión: `unstable_cache` guarda entre
   peticiones y compartiría datos entre usuarios distintos.
=========================================================================== */

const TTL = 60; // segundos

/** Contadores de la barra lateral. */
export const getSpaceCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const [members, events, posts, blogs, podcast] = await Promise.all([
      prisma.user.count(),
      prisma.event.count({ where: { startsAt: { gte: new Date() } } }),
      prisma.post.count(),
      prisma.observatoryPost.count(),
      prisma.podcastEpisode.count(),
    ]);
    return { members, events, posts, blogs, podcast };
  },
  ["community-space-counts"],
  { revalidate: TTL, tags: ["community"] },
);

const eventSelect = {
  id: true,
  title: true,
  slug: true,
  startsAt: true,
  isOnline: true,
} as const;

/**
 * OJO con `startsAt`: es una CADENA ISO, no un Date.
 *
 * `unstable_cache` guarda el resultado serializado a JSON, así que en el
 * acierto de caché los Date vuelven convertidos en texto. Devolverlos ya como
 * cadena hace que el tipo diga la verdad en los dos caminos —fallo y acierto—
 * en vez de mentir en uno de ellos y reventar en tiempo de ejecución.
 */
export type RailEvent = {
  id: string;
  title: string;
  slug: string;
  startsAt: string;
  isOnline: boolean;
};

/** Eventos y recién llegados de la columna derecha. */
export const getRailData = unstable_cache(
  async (): Promise<{
    events: RailEvent[];
    showingPast: boolean;
    members: { id: string; name: string; country: string | null; building: string | null }[];
  }> => {
    const [upcoming, members] = await Promise.all([
      prisma.event.findMany({
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 3,
        select: eventSelect,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, name: true, country: true, building: true },
      }),
    ]);

    // Si no hay nada por venir, se muestran los últimos celebrados en vez de un
    // hueco vacío: un módulo muerto hace que toda la página parezca abandonada.
    const past =
      upcoming.length > 0
        ? []
        : await prisma.event.findMany({
            orderBy: { startsAt: "desc" },
            take: 3,
            select: eventSelect,
          });

    const chosen = upcoming.length > 0 ? upcoming : past;
    return {
      events: chosen.map((e) => ({ ...e, startsAt: e.startsAt.toISOString() })),
      showingPast: upcoming.length === 0 && past.length > 0,
      members,
    };
  },
  ["community-rail"],
  { revalidate: TTL, tags: ["community"] },
);
