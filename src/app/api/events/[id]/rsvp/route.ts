import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return Response.json({ error: "not_found" }, { status: 404 });

  const existing = await prisma.rsvp.findUnique({
    where: { eventId_userId: { eventId: id, userId: session.sub } },
  });

  let going: boolean;
  if (existing) {
    await prisma.rsvp.delete({ where: { id: existing.id } });
    going = false;
  } else {
    await prisma.rsvp.create({ data: { eventId: id, userId: session.sub } });
    going = true;
  }

  const count = await prisma.rsvp.count({ where: { eventId: id } });
  return Response.json({ going, count });
}
