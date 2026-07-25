/**
 * Inserta SOLO los posts del Bootcamp Utah 2027 en una base ya sembrada.
 *
 * A diferencia de `seed.ts`, este script NO borra nada: `seed.ts` arranca con
 * deleteMany() de todas las tablas, así que ejecutarlo contra producción
 * destruiría los datos reales. Este es aditivo e idempotente — si los posts
 * de bootcamp ya existen, sale sin tocar nada.
 *
 *   npx tsx prisma/add-bootcamp-posts.ts
 *
 * Para revertir:  DELETE FROM "Post" WHERE category = 'BOOTCAMP';
 * (los comentarios y reacciones caen solos por onDelete: Cascade)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const now = new Date();
const DAY = 86_400_000;
function at(daysFromNow: number, hour = 18, min = 0): Date {
  const d = new Date(now.getTime() + daysFromNow * DAY);
  d.setHours(hour, min, 0, 0);
  return d;
}

async function main() {
  const already = await prisma.post.count({ where: { category: "BOOTCAMP" } });
  if (already > 0) {
    console.log(`Ya hay ${already} posts de BOOTCAMP. No se inserta nada.`);
    return;
  }

  // Se buscan por rol/correo para no depender de ids concretos.
  const [equipo, ana, roberto, mateo] = await Promise.all([
    prisma.user.findFirst({ where: { role: "ADMIN" } }),
    prisma.user.findFirst({ where: { role: "MENTOR" } }),
    prisma.user.findFirst({ where: { role: "PARENT" } }),
    prisma.user.findFirst({ where: { role: "MEMBER" } }),
  ]);

  if (!equipo || !ana || !roberto || !mateo) {
    throw new Error(
      `Faltan usuarios base (admin/mentor/padre/miembro). Encontrados: ${[
        equipo && "admin",
        ana && "mentor",
        roberto && "parent",
        mateo && "member",
      ]
        .filter(Boolean)
        .join(", ") || "ninguno"}`,
    );
  }

  const b1 = await prisma.post.create({
    data: {
      authorId: equipo.id,
      title: "🚀 Abrimos inscripciones: Bootcamp Utah 2027",
      // Fijado: abre el feed y lleva dentro el cuadro de acceso al bootcamp.
      pinned: true,
      body: "Del 26 al 31 de enero de 2027: 4 días y 5 noches en Utah. Universidades por dentro (BYU, University of Utah, American Fork High School), las empresas de Silicon Slopes, el día GÉNESIS i7™ con un profesional por cada inteligencia y la ceremonia donde se premia el mejor proyecto Star App.\n\nInscripción $250: reserva tu cupo y emitimos la carta de invitación oficial para tu hijo Y para un acompañante. Hay 50 cupos y el cierre es el 15 de diciembre. El programa completo está en la sección Bootcamp 2027.",
      category: "BOOTCAMP",
      createdAt: at(-1, 9),
    },
  });
  await prisma.comment.createMany({
    data: [
      { postId: b1.id, authorId: roberto.id, body: "¿La carta de invitación sirve para la cita en el consulado de mi país?", createdAt: at(-1, 10) },
      { postId: b1.id, authorId: ana.id, body: "Sí, Roberto. Es la carta oficial que presentas en la entrevista. Agenda la cita apenas la recibas: es el paso que más tarda.", createdAt: at(-1, 11) },
    ],
  });
  await prisma.reaction.createMany({
    data: [
      { postId: b1.id, userId: mateo.id, type: "CELEBRATE" },
      { postId: b1.id, userId: roberto.id, type: "CELEBRATE" },
      { postId: b1.id, userId: ana.id, type: "CELEBRATE" },
    ],
  });

  await prisma.post.create({
    data: {
      authorId: ana.id,
      title: "Día 3 del bootcamp: siete profesionales, uno por cada inteligencia",
      body: "Es el día que más ilusión me hace. Siete mesas, siete conversaciones reales: Espiritual, Mental, Física, Emocional, Social, Financiera y Tecnológica. Y al cierre, la ceremonia Star App con escenario y jurado.\n\nA los chicos les cambia la cara cuando un profesional de verdad les pregunta qué están construyendo.",
      category: "BOOTCAMP",
      createdAt: at(-2, 15),
    },
  });

  const b3 = await prisma.post.create({
    data: {
      authorId: roberto.id,
      title: "Ya empezamos el trámite de la visa para Utah",
      body: "Nos inscribimos la semana pasada, la carta llegó en tres días y hoy agendamos la cita en el consulado. Si están pensando ir con sus hijos: no lo dejen para después, la cita es lo que más demora.",
      category: "BOOTCAMP",
      createdAt: at(-3, 19),
    },
  });
  await prisma.comment.create({
    data: { postId: b3.id, authorId: equipo.id, body: "Gracias por contarlo, Roberto. Es exactamente el orden correcto. 👏", createdAt: at(-3, 20) },
  });
  await prisma.reaction.create({
    data: { postId: b3.id, userId: mateo.id, type: "CELEBRATE" },
  });

  await prisma.post.create({
    data: {
      authorId: equipo.id,
      title: "Qué cubre (y qué no) la inscripción de $250",
      body: "Cubre: tu cupo en el bootcamp, la carta de invitación oficial para tu hijo Y para un acompañante, el programa completo de los 4 días y nuestro acompañamiento durante todo el proceso. Son DOS cartas por los mismos $250.\n\nNo cubre: vuelos, hospedaje de las 5 noches, comidas, transporte local en Utah ni las tasas consulares. Lo decimos claro desde el principio para que cada familia haga su cuenta con datos reales.",
      category: "BOOTCAMP",
      createdAt: at(-4, 11),
    },
  });

  const total = await prisma.post.count({ where: { category: "BOOTCAMP" } });
  console.log(`OK — ${total} posts de BOOTCAMP insertados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
