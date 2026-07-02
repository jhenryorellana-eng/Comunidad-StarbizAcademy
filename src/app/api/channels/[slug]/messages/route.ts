import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, isMember } from "@/lib/auth";

function dto(m: {
  id: string;
  body: string;
  createdAt: Date;
  userId: string;
  user: { name: string };
}) {
  return {
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    userId: m.userId,
    author: { name: m.user.name },
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  if (!isMember(session?.role)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const channel = await prisma.channel.findUnique({ where: { slug } });
  if (!channel) return Response.json({ error: "not_found" }, { status: 404 });

  const recent = await prisma.message.findMany({
    where: { channelId: channel.id },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { user: { select: { name: true } } },
  });
  return Response.json({ messages: recent.reverse().map(dto) });
}

const schema = z.object({ body: z.string().trim().min(1).max(2000) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  if (!isMember(session?.role)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const channel = await prisma.channel.findUnique({ where: { slug } });
  if (!channel) return Response.json({ error: "not_found" }, { status: 404 });

  const data = await req.json().catch(() => null);
  const parsed = schema.safeParse(data);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  const msg = await prisma.message.create({
    data: { channelId: channel.id, userId: session!.sub, body: parsed.data.body },
    include: { user: { select: { name: true } } },
  });
  return Response.json({ message: dto(msg) }, { status: 201 });
}
