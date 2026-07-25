/**
 * Corrige los posts de BOOTCAMP ya insertados en la base.
 *
 * Motivo: la inscripción de $250 cubre la carta de invitación del participante
 * Y de UN acompañante (eran dos cartas, no una), y ya hay cupos (50) y fecha de
 * cierre (15 de diciembre). Los posts se sembraron antes de saberlo.
 *
 *   npx tsx prisma/fix-bootcamp-posts.ts
 *
 * Sólo hace UPDATE sobre los dos posts afectados. No borra ni crea nada.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ANUNCIO_TITULO = "🚀 Abrimos inscripciones: Bootcamp Utah 2027";
const ANUNCIO_BODY =
  "Del 26 al 31 de enero de 2027: 4 días y 5 noches en Utah. Universidades por dentro (BYU, University of Utah, American Fork High School), las empresas de Silicon Slopes, el día GÉNESIS i7™ con un profesional por cada inteligencia y la ceremonia donde se premia el mejor proyecto Star App.\n\nInscripción $250: reserva tu cupo y emitimos la carta de invitación oficial para tu hijo Y para un acompañante. Hay 50 cupos y el cierre es el 15 de diciembre. El programa completo está en la sección Bootcamp 2027.";

const PRECIO_TITULO = "Qué cubre (y qué no) la inscripción de $250";
const PRECIO_BODY =
  "Cubre: tu cupo en el bootcamp, la carta de invitación oficial para tu hijo Y para un acompañante, el programa completo de los 4 días y nuestro acompañamiento durante todo el proceso. Son DOS cartas por los mismos $250.\n\nNo cubre: vuelos, hospedaje de las 5 noches, comidas, transporte local en Utah ni las tasas consulares. Lo decimos claro desde el principio para que cada familia haga su cuenta con datos reales.";

async function main() {
  const a = await prisma.post.updateMany({
    where: { category: "BOOTCAMP", title: ANUNCIO_TITULO },
    // Fijado: abre el feed y lleva dentro el cuadro de acceso al bootcamp.
    data: { body: ANUNCIO_BODY, pinned: true },
  });
  const b = await prisma.post.updateMany({
    where: { category: "BOOTCAMP", title: PRECIO_TITULO },
    data: { body: PRECIO_BODY },
  });
  console.log(`Actualizados — anuncio: ${a.count}, precio: ${b.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
