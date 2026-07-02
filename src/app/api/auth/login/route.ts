import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => null);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return Response.json({ error: "invalid" }, { status: 401 });
  }

  const token = await signSession({
    sub: user.id,
    role: user.role as never,
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);

  return Response.json({ user: { id: user.id, name: user.name, role: user.role } });
}
