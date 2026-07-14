import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { postInclude, toPostDTO, reactedPostIds } from "@/lib/posts";
import { OrbitFeed } from "@/components/community/OrbitFeed";

export const metadata: Metadata = { title: "Órbita — StarbizAcademy" };

// Recorrido finito a propósito: lo más reciente y nada más — sin scroll
// infinito (lineamientos de diseño para menores).
const ORBIT_SIZE = 30;

export default async function OrbitaPage() {
  const user = await getCurrentUser();
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: ORBIT_SIZE,
    include: postInclude,
  });
  const myReacted = await reactedPostIds(user?.id, posts.map((p) => p.id));

  return (
    <OrbitFeed posts={posts.map((p) => toPostDTO(p, myReacted))} loggedIn={!!user} />
  );
}
