import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, isMember } from "@/lib/auth";

const schema = z.object({ body: z.string().trim().min(1).max(2000) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!isMember(session?.role)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const data = await req.json().catch(() => null);
  const parsed = schema.safeParse(data);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { postId: id, authorId: session!.sub, body: parsed.data.body },
    include: { author: { select: { name: true } } },
  });
  return Response.json({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    author: { name: comment.author.name },
  });
}
