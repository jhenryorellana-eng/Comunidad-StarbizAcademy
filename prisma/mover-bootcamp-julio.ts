/**
 * Lleva a la base el cambio de fechas del Bootcamp Utah 2027.
 *
 * Motivo: el viaje pasó del 26-31 de enero al 27 de julio - 1 de agosto para que
 * el día 4 caiga dentro de las puertas abiertas del Templo de Salt Lake, y el
 * cierre pasó al 31 de marzo. La web lee casi todo del código, pero el post
 * fijado del feed y los dos eventos del calendario viven en la base.
 *
 *   npx tsx --env-file=.env prisma/mover-bootcamp-julio.ts
 *
 * ⚠ El `.env` local apunta a PRODUCCIÓN. Sólo hace UPDATE sobre esas tres filas
 * y se puede repetir. No toca inscripciones ni cartas.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Hora de pared en UTC, igual que el resto del calendario (ver add-eventos-2026.ts).
const U = (iso: string) => new Date(iso + "Z");

const ANUNCIO_TITULO = "🚀 Abrimos inscripciones: Bootcamp Utah 2027";
const ANUNCIO_BODY =
  "Del 27 de julio al 1 de agosto de 2027: 4 días y 5 noches en Utah. Universidades por dentro (BYU, University of Utah), las empresas de Silicon Slopes, el día GÉNESIS i7™ con un profesional por cada inteligencia, la ceremonia donde se premia el mejor proyecto Star App y, para cerrar, las puertas abiertas del Templo de Salt Lake.\n\nInscripción $250: reserva tu cupo y emitimos la carta de invitación oficial para tu hijo Y para un acompañante. Hay 50 cupos y el cierre es el 31 de marzo. El programa completo está en la sección Bootcamp 2027.";

async function main() {
  const post = await prisma.post.updateMany({
    where: { category: "BOOTCAMP", title: ANUNCIO_TITULO },
    data: { body: ANUNCIO_BODY },
  });
  const cierre = await prisma.event.updateMany({
    where: { slug: "cierre-inscripciones-bootcamp-2027" },
    data: { startsAt: U("2027-03-31T23:59:00") },
  });
  const viaje = await prisma.event.updateMany({
    where: { slug: "bootcamp-utah-2027" },
    data: {
      startsAt: U("2027-07-27T09:00:00"),
      endsAt: U("2027-08-01T18:00:00"),
      description:
        "Cuatro días, cinco noches. Universidades por dentro, las empresas que construyen la tecnología de Utah, los siete profesionales de GÉNESIS i7™, la ceremonia Star App y las puertas abiertas del Templo de Salt Lake.",
    },
  });
  console.log(`Actualizados — anuncio: ${post.count}, cierre: ${cierre.count}, viaje: ${viaje.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
