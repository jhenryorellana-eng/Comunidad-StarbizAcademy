import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(6).max(100),
  building: z.string().trim().min(1).max(60),
});

/**
 * El registro público crea SOLO cuentas de padre/tutor (Padres 3.0).
 * Los menores (CEO Junior) no se autoregistran: su cuenta la crea el padre
 * desde /familia (POST /api/family/children), con fecha de nacimiento <18.
 */
export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => null);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "exists" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
      building: parsed.data.building,
      parentalConsent: true, // es el propio padre/madre/tutor
      role: ROLES.PARENT,
    },
  });

  const token = await signSession({
    sub: user.id,
    role: user.role as never,
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);

  return Response.json(
    { user: { id: user.id, name: user.name, role: user.role } },
    { status: 201 },
  );
}
