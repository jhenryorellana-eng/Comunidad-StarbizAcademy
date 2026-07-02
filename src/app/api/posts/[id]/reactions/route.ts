import { prisma } from "@/lib/prisma";
import { getSession, isMember } from "@/lib/auth";

const TYPE = "CELEBRATE";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!isMember(session?.role)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.reaction.findUnique({
    where: { postId_userId_type: { postId: id, userId: session!.sub, type: TYPE } },
  });

  let reacted: boolean;
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    reacted = false;
  } else {
    await prisma.reaction.create({
      data: { postId: id, userId: session!.sub, type: TYPE },
    });
    reacted = true;
  }

  const count = await prisma.reaction.count({ where: { postId: id } });
  return Response.json({ reacted, count });
}
