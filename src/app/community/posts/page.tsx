import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isMember } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { PostComposer } from "@/components/community/PostComposer";
import { PostFeed, type PostDTO } from "@/components/community/PostFeed";

export default async function PostsPage() {
  const { dict } = await getDict();
  const user = await getCurrentUser();
  const member = isMember(user?.role);

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, role: true, createdAt: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true } } },
      },
      _count: { select: { reactions: true } },
    },
  });

  const myReacted = user
    ? new Set(
        (
          await prisma.reaction.findMany({
            where: { userId: user.id, postId: { in: posts.map((p) => p.id) } },
            select: { postId: true },
          })
        ).map((r) => r.postId),
      )
    : new Set<string>();

  const dto: PostDTO[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    category: p.category,
    createdAt: p.createdAt.toISOString(),
    author: {
      name: p.author.name,
      role: p.author.role,
      createdAt: p.author.createdAt.toISOString(),
    },
    reactionCount: p._count.reactions,
    reactedByMe: myReacted.has(p.id),
    comments: p.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      author: { name: c.author.name },
    })),
  }));

  return (
    <div>
      <SpaceHeader icon="posts" title={dict.community.posts.title} />
      <SpaceBanner />

      {member ? (
        <PostComposer userName={user!.name} />
      ) : (
        <div className="mb-6 rounded-2xl border border-surface-line bg-paper p-4 text-center text-sm text-muted">
          {dict.community.posts.loginToPost}{" "}
          <Link href="/login" className="font-semibold text-cyan hover:underline">
            {dict.common.login}
          </Link>
        </div>
      )}

      <PostFeed posts={dto} loggedIn={!!user} />
    </div>
  );
}
