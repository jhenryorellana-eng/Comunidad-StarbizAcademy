import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, isMember } from "@/lib/auth";
import { parseVideoUrl } from "@/lib/video";

const firstSaleSchema = z.object({
  sold: z.string().trim().min(1).max(200),
  to: z.string().trim().min(1).max(200),
  amount: z.string().trim().min(1).max(100),
  learned: z.string().trim().min(1).max(1000),
});

const schema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(1).max(5000),
  category: z.enum(["COMMUNITY", "VOICE", "ANNOUNCEMENT", "FIRST_SALE"]).optional(),
  videoUrl: z.string().trim().max(300).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!isMember(session?.role)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const data = await req.json().catch(() => null);
  const parsed = schema.safeParse(data);
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  // "Mi primera venta" es estructurado, no texto libre: el body debe ser el JSON válido.
  if (parsed.data.category === "FIRST_SALE") {
    let saleJson: unknown = null;
    try {
      saleJson = JSON.parse(parsed.data.body);
    } catch {
      return Response.json({ error: "invalid" }, { status: 400 });
    }
    if (!firstSaleSchema.safeParse(saleJson).success) {
      return Response.json({ error: "invalid" }, { status: 400 });
    }
  }

  // Solo se guardan videos de YouTube/Vimeo verificados por el parser.
  const videoUrl = parsed.data.videoUrl || null;
  if (videoUrl && !parseVideoUrl(videoUrl)) {
    return Response.json({ error: "video" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      authorId: session!.sub,
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category ?? "COMMUNITY",
      videoUrl,
    },
  });
  return Response.json({ id: post.id }, { status: 201 });
}
