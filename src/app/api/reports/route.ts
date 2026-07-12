import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  targetType: z.enum(["POST", "MEMBER"]),
  targetId: z.string().trim().min(3).max(64),
  reason: z.string().trim().max(500).optional(),
});

// Reports are accepted from anyone (a worried parent may not have an account);
// the reporter is attached when a session exists.
export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => null);
  const parsed = schema.safeParse(data);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  const session = await getSession();
  await prisma.report.create({
    data: {
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason ?? null,
      reporterId: session?.sub ?? null,
    },
  });
  return Response.json({ ok: true }, { status: 201 });
}
