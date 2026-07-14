import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isMember } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { postInclude, toPostDTO, reactedPostIds } from "@/lib/posts";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { PostComposer } from "@/components/community/PostComposer";
import { PostFeed, type PostDTO } from "@/components/community/PostFeed";
import { cn } from "@/components/ui";

const FILTERS = ["recientes", "populares", "primera-venta"] as const;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro = "recientes" } = await searchParams;
  const { dict } = await getDict();
  const P = dict.community.posts;
  const user = await getCurrentUser();
  const member = isMember(user?.role);

  const posts = await prisma.post.findMany({
    where: filtro === "primera-venta" ? { category: "FIRST_SALE" } : {},
    orderBy:
      filtro === "populares"
        ? { reactions: { _count: "desc" } }
        : { createdAt: "desc" },
    include: postInclude,
  });

  const myReacted = await reactedPostIds(user?.id, posts.map((p) => p.id));

  // Privacy: full last names never leave the server — truncated in toPostDTO.
  const dto: PostDTO[] = posts.map((p) => toPostDTO(p, myReacted));

  const tabs: Array<[(typeof FILTERS)[number], string]> = [
    ["recientes", P.filterRecent],
    ["populares", P.filterPopular],
    ["primera-venta", P.filterFirstSale],
  ];

  return (
    <div>
      <SpaceHeader icon="posts" title={P.title} />
      <SpaceBanner />

      {member ? (
        <PostComposer userName={user!.name} />
      ) : (
        <div className="mb-6 rounded-2xl border border-surface-line bg-paper p-4 text-center text-sm text-muted">
          {P.loginToPost}{" "}
          <Link href="/login" className="font-semibold text-cyan hover:underline">
            {dict.common.login}
          </Link>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            href={key === "recientes" ? "/comunidad/posts" : `/comunidad/posts?filtro=${key}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filtro === key
                ? "border-navy bg-navy text-white"
                : "border-surface-line bg-paper text-ink hover:border-navy/30",
              key === "primera-venta" && filtro !== key && "text-cyan-700",
            )}
          >
            {key === "primera-venta" ? "⭐ " : ""}
            {label}
          </Link>
        ))}
      </div>

      <PostFeed posts={dto} loggedIn={!!user} />
    </div>
  );
}
