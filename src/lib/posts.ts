import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { publicName } from "./format";
import type { PostDTO } from "@/components/community/PostFeed";

// Include compartido entre el feed y la página de detalle de un post.
export const postInclude = {
  author: { select: { name: true, role: true, createdAt: true } },
  comments: {
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true } } },
  },
  _count: { select: { reactions: true } },
} satisfies Prisma.PostInclude;

type PostWithRelations = Prisma.PostGetPayload<{ include: typeof postInclude }>;

/**
 * Privacidad: los apellidos completos nunca salen del servidor — se truncan
 * aquí (publicName) antes de enviar el post al cliente.
 */
export function toPostDTO(p: PostWithRelations, myReacted: Set<string>): PostDTO {
  return {
    id: p.id,
    title: p.title,
    body: p.body,
    category: p.category,
    videoUrl: p.videoUrl,
    createdAt: p.createdAt.toISOString(),
    author: {
      name: publicName(p.author.name),
      role: p.author.role,
      createdAt: p.author.createdAt.toISOString(),
    },
    reactionCount: p._count.reactions,
    reactedByMe: myReacted.has(p.id),
    comments: p.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      author: { name: publicName(c.author.name) },
    })),
  };
}

/** Ids de posts a los que el usuario ya reaccionó (para el estado inicial). */
export async function reactedPostIds(
  userId: string | undefined,
  postIds: string[],
): Promise<Set<string>> {
  if (!userId || postIds.length === 0) return new Set();
  const rows = await prisma.reaction.findMany({
    where: { userId, postId: { in: postIds } },
    select: { postId: true },
  });
  return new Set(rows.map((r) => r.postId));
}
