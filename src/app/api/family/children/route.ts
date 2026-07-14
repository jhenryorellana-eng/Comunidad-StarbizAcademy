import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { ageInYears } from "@/lib/format";
import { ROLES } from "@/lib/constants";

// La comunidad joven es SOLO para menores de edad; el piso descarta typos
// en la fecha (p. ej. un año de nacimiento imposible).
const MAX_CHILD_AGE = 17;
const MIN_CHILD_AGE = 6;

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(6).max(100),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  building: z.string().trim().min(1).max(60),
});

/**
 * Alta de un CEO Junior: solo puede hacerla una cuenta de padre/tutor
 * (o admin). Ese acto ES el consentimiento parental, y la fecha de
 * nacimiento se valida en el servidor — no se aceptan mayores de 18.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== ROLES.PARENT && session.role !== ROLES.ADMIN)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const data = await req.json().catch(() => null);
  const parsed = schema.safeParse(data);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  const birthdate = new Date(`${parsed.data.birthdate}T00:00:00Z`);
  if (Number.isNaN(birthdate.getTime())) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const age = ageInYears(birthdate);
  if (age > MAX_CHILD_AGE) return Response.json({ error: "age" }, { status: 400 });
  if (age < MIN_CHILD_AGE) return Response.json({ error: "birthdate" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return Response.json({ error: "exists" }, { status: 409 });

  const child = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
      building: parsed.data.building,
      birthdate,
      parentalConsent: true,
      parentId: session.sub,
      role: ROLES.MEMBER,
    },
  });

  return Response.json(
    { child: { id: child.id, name: child.name } },
    { status: 201 },
  );
}
