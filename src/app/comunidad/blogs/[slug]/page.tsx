import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n/server";
import { formatDate, readMinutes } from "@/lib/format";
import { Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/motion";

// Motor de tráfico orgánico: URL limpia + meta-imagen + schema de artículo.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.observatoryPost.findUnique({ where: { slug } });
  if (!post) return {};
  return {
    title: `${post.title} — StarbizAcademy Blogs`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      images: [{ url: post.cover || "/og-image.jpg" }],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, dict } = await getDict();
  const B = dict.community.blogs;
  const post = await prisma.observatoryPost.findUnique({ where: { slug } });
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    author: { "@type": "Organization", name: post.authors },
    publisher: { "@type": "Organization", name: "StarbizAcademy" },
    datePublished: post.publishedAt.toISOString(),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/comunidad/blogs"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-cyan"
      >
        <Icon name="arrowRight" size={14} className="rotate-180" />
        {B.back}
      </Link>

      <Reveal>
        {post.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover}
            alt=""
            className="mb-6 h-56 w-full rounded-2xl object-cover sm:h-72"
          />
        ) : (
          <div className="mb-6 flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-navy via-navy-700 to-cyan-700 sm:h-52">
            <Icon name="fileText" size={40} className="text-white/40" />
          </div>
        )}

        <div className="mx-auto max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <Badge tone="cyan">{formatDate(post.publishedAt, locale)}</Badge>
            <span>
              {readMinutes(post.body)} {B.readTime}
            </span>
            <span>· {B.by} {post.authors}</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 font-serif text-lg italic leading-relaxed text-ink/80">
            {post.summary}
          </p>
          <div className="mt-6 whitespace-pre-line rounded-2xl border border-surface-line bg-paper p-6 text-base leading-relaxed text-ink/90 sm:p-8">
            {post.body}
          </div>
        </div>
      </Reveal>
    </article>
  );
}
