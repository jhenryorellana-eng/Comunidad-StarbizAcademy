import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, isMember } from "@/lib/auth";

const schema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(1).max(5000),
  category: z.enum(["COMMUNITY", "VOICE", "ANNOUNCEMENT"]).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!isMember(session?.role)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const data = await req.json().catch(() => null);
  const parsed = schema.safeParse(data);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  const post = await prisma.post.create({
    data: {
      authorId: session!.sub,
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category ?? "COMMUNITY",
    },
  });
  return Response.json({ id: post.id }, { status: 201 });
}
