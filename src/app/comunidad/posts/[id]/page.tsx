import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { postInclude, toPostDTO, reactedPostIds } from "@/lib/posts";
import { PostFeed } from "@/components/community/PostFeed";
import { Icon } from "@/components/icons";

type Params = { params: Promise<{ id: string }> };

// Destino de los enlaces compartidos (WhatsApp, etc.): un post con sus
// comentarios desplegados y metadata OG para la vista previa del chat.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, select: { title: true } });
  if (!post) return {};
  return {
    title: `${post.title} — StarbizAcademy`,
    openGraph: { title: post.title, siteName: "StarbizAcademy" },
  };
}

export default async function PostDetailPage({ params }: Params) {
  const { id } = await params;
  const [user, post, { dict }] = await Promise.all([
    getCurrentUser(),
    prisma.post.findUnique({ where: { id }, include: postInclude }),
    getDict(),
  ]);
  if (!post) notFound();

  const myReacted = await reactedPostIds(user?.id, [post.id]);

  return (
    <div>
      <Link
        href="/comunidad/posts"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-cyan hover:underline"
      >
        <Icon name="arrowRight" size={15} className="rotate-180" />
        {dict.community.posts.backToFeed}
      </Link>
      <PostFeed posts={[toPostDTO(post, myReacted)]} loggedIn={!!user} openComments />
    </div>
  );
}
