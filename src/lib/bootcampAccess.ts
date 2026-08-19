import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

/**
 * Quién puede reservar cupo, y en qué punto está.
 *
 * El botón del bootcamp ya no es un enlace: tiene que decir cosas distintas
 * según quién mire. Esa decisión se toma UNA vez, en el servidor, y viaja
 * resuelta al componente — si la tomara el cliente habría un parpadeo entre lo
 * que se pinta primero y lo que resulta ser verdad.
 */
export type EstadoBootcamp =
  | { tipo: "invitado" }
  | { tipo: "menor" }
  | { tipo: "sin-hijos" }
  | { tipo: "elegir"; hijos: Array<{ id: string; name: string; edad: number | null }> }
  | { tipo: "todos-inscritos"; nombres: string[] };

function edadDe(fecha: Date | null): number | null {
  if (!fecha) return null;
  const hoy = new Date();
  let a = hoy.getUTCFullYear() - fecha.getUTCFullYear();
  const m = hoy.getUTCMonth() - fecha.getUTCMonth();
  if (m < 0 || (m === 0 && hoy.getUTCDate() < fecha.getUTCDate())) a--;
  return a;
}

export async function estadoBootcamp(): Promise<EstadoBootcamp> {
  const user = await getCurrentUser();
  if (!user) return { tipo: "invitado" };

  // Un menor no compra su propio viaje. Se lo dice claro en vez de dejarle
  // pulsar y encontrarse un 403.
  if (user.role !== ROLES.PARENT && user.role !== ROLES.ADMIN) {
    return { tipo: "menor" };
  }

  const hijos = await prisma.user.findMany({
    where: { parentId: user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      birthdate: true,
      bootcampCupos: {
        where: { status: "PAID" },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (hijos.length === 0) return { tipo: "sin-hijos" };

  const libres = hijos.filter((h) => h.bootcampCupos.length === 0);
  if (libres.length === 0) {
    return { tipo: "todos-inscritos", nombres: hijos.map((h) => h.name) };
  }

  return {
    tipo: "elegir",
    hijos: libres.map((h) => ({ id: h.id, name: h.name, edad: edadDe(h.birthdate) })),
  };
}
