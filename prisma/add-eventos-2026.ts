import { PrismaClient } from "@prisma/client";

/**
 * Calendario de cara al Bootcamp Utah 2027.
 *
 * ADITIVO E IDEMPOTENTE: `upsert` por slug, no borra nada. Se puede repetir.
 *
 * Por qué hace falta: los 5 eventos sembrados son todos de junio/julio de 2026.
 * En público, la pestaña "Próximos" saldría vacía — una comunidad sin nada por
 * delante. Además `evt_weekly` sigue con status LIVE, así que un evento del 3 de
 * julio muestra el badge rojo "EN VIVO".
 *
 * ⚠ LAS FECHAS SON PROPUESTAS. Las dos últimas están fijadas por el propio
 * bootcamp y no se mueven; las tres primeras hay que confirmarlas antes de
 * anunciarlas — son compromisos con familias reales.
 *
 * Para revertir:
 *   UPDATE "Event" SET status = 'LIVE' WHERE id = 'evt_weekly';
 *   DELETE FROM "Event" WHERE slug IN (
 *     'reunion-semanal-2026-07-31', 'sesion-informativa-bootcamp-utah-2027',
 *     'taller-ds160-cita-consular', 'cierre-inscripciones-bootcamp-2027',
 *     'bootcamp-utah-2027'
 *   );
 */
const prisma = new PrismaClient();

/**
 * Los eventos se guardan como hora de pared en UTC, igual que la semilla
 * original ("19:00:00.000Z"). No es purismo: `Intl.DateTimeFormat` en
 * `src/lib/format.ts` no fija `timeZone`, así que usa la del proceso — y en
 * Vercel es UTC. Guardar "23:59-06:00" haría que el cierre de inscripciones
 * apareciera como 16 de diciembre mientras toda la web dice 15.
 */
const U = (iso: string) => new Date(iso + "Z");

const EVENTOS = [
  {
    slug: "reunion-semanal-2026-07-31",
    title: "Reunión semanal de la Comunidad",
    description:
      "El encuentro abierto y gratuito donde vive el ecosistema. Familias y jóvenes conectan, comparten avances y conocen GÉNESIS i7™.",
    startsAt: U("2026-07-31T19:00:00"),
    endsAt: U("2026-07-31T20:30:00"),
    location: "Zoom · En línea",
    isOnline: true,
    category: "WEEKLY",
    price: "Free",
    featured: false,
    confirmar: true,
  },
  {
    slug: "sesion-informativa-bootcamp-utah-2027",
    title: "Sesión informativa: Bootcamp Utah 2027",
    description:
      "Todo el viaje explicado para padres: los 4 días en Utah, qué cubren los $250, las dos cartas de invitación y el trámite de visa paso a paso. Con espacio para preguntas.",
    startsAt: U("2026-08-07T19:00:00"),
    endsAt: U("2026-08-07T20:30:00"),
    location: "Zoom · En línea",
    isOnline: true,
    category: "SUMMIT",
    price: "Free",
    featured: true,
    confirmar: true,
  },
  {
    slug: "taller-ds160-cita-consular",
    title: "Taller: DS-160 y cita consular, paso a paso",
    description:
      "El cuello de botella del viaje. Llenamos el DS-160 juntos y agendamos la cita del consulado en vivo. En varios países la cita se da con meses de espera: cuanto antes, mejor.",
    startsAt: U("2026-08-21T19:00:00"),
    endsAt: U("2026-08-21T21:00:00"),
    location: "Zoom · En línea",
    isOnline: true,
    category: "WORKSHOP",
    price: "Free",
    featured: false,
    confirmar: true,
  },
  {
    // Fecha ya publicada en la página del bootcamp. No se mueve.
    slug: "cierre-inscripciones-bootcamp-2027",
    title: "Cierre de inscripciones — Bootcamp Utah 2027",
    description:
      "Último día para reservar cupo. Después de esta fecha ya no da tiempo a emitir las cartas y agendar la cita consular antes del viaje.",
    startsAt: U("2026-12-15T23:59:00"),
    endsAt: null,
    location: "En línea",
    isOnline: true,
    category: "SUMMIT",
    price: "$250 USD",
    featured: true,
    confirmar: false,
  },
  {
    // El viaje. Fechas ya publicadas.
    slug: "bootcamp-utah-2027",
    title: "Bootcamp Utah 2027",
    description:
      "Cuatro días, cinco noches. Universidades por dentro, las empresas que construyen la tecnología de Utah, los siete profesionales de GÉNESIS i7™ y la ceremonia Star App.",
    startsAt: U("2027-01-26T09:00:00"),
    endsAt: U("2027-01-31T18:00:00"),
    location: "Utah, Estados Unidos",
    isOnline: false,
    category: "SUMMIT",
    price: "$250 USD",
    featured: true,
    confirmar: false,
  },
];

async function main() {
  // El badge "EN VIVO" congelado en un evento de hace semanas.
  const arreglado = await prisma.event.updateMany({
    where: { status: "LIVE", startsAt: { lt: new Date() } },
    data: { status: "PAST" },
  });
  console.log(`  status LIVE caducado corregido: ${arreglado.count} evento(s)`);

  for (const { confirmar, ...e } of EVENTOS) {
    const r = await prisma.event.upsert({
      where: { slug: e.slug },
      create: { ...e, host: "StarbizAcademy", status: "UPCOMING" },
      update: { ...e, status: "UPCOMING" },
    });
    console.log(
      `  ${r.startsAt.toISOString().slice(0, 10)}  ${r.title}${confirmar ? "   ← confirmar fecha" : ""}`,
    );
  }

  const futuros = await prisma.event.count({ where: { startsAt: { gte: new Date() } } });
  console.log(`\n  eventos futuros en total: ${futuros}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
