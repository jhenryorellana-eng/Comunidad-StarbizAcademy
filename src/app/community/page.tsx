import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n/server";
import { dayChip, formatDate, timeAgo } from "@/lib/format";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";

export default async function FeedPage() {
  const { locale, dict } = await getDict();
  const now = new Date();

  const [events, posts, episodes] = await Promise.all([
    prisma.event.findMany({
      where: { startsAt: { gte: new Date(now.getTime() - 3 * 3600_000) } },
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        author: { select: { name: true } },
        _count: { select: { comments: true, reactions: true } },
      },
    }),
    prisma.podcastEpisode.findMany({ orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);

  const SectionTitle = ({ title, href }: { title: string; href: string }) => (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
        {title}
      </h2>
      <Link href={href} className="text-xs font-semibold text-cyan hover:underline">
        {dict.common.readMore} →
      </Link>
    </div>
  );

  return (
    <div>
      <SpaceHeader icon="home" title={dict.community.spaces.feed} subtitle={dict.community.feedIntro} />
      <SpaceBanner />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upcoming events */}
        <section className="lg:col-span-2">
          <SectionTitle title={dict.community.upcomingEvents} href="/community/events" />
          <div className="grid gap-3 sm:grid-cols-3">
            {events.map((e) => {
              const chip = dayChip(e.startsAt, locale);
              return (
                <Link
                  key={e.id}
                  href="/community/events"
                  className="flex gap-3 rounded-2xl border border-surface-line bg-paper p-4 hover:shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-cream-200 text-navy">
                    <span className="text-base font-extrabold leading-none">{chip.day}</span>
                    <span className="text-[0.6rem] font-semibold text-muted">{chip.month}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-navy">{e.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {e.isOnline ? dict.common.online : e.location}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Latest posts */}
        <section>
          <SectionTitle title={dict.community.latestPosts} href="/community/posts" />
          <div className="space-y-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                href="/community/posts"
                className="block rounded-2xl border border-surface-line bg-paper p-4 hover:shadow-sm"
              >
                <p className="font-semibold leading-snug text-navy">{p.title}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <Avatar name={p.author.name} size={22} />
                  {p.author.name} · {timeAgo(p.createdAt, locale)} · 👏 {p._count.reactions} ·{" "}
                  <Icon name="chat" size={12} className="inline" /> {p._count.comments}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* New episodes */}
        <section>
          <SectionTitle title={dict.community.newEpisodes} href="/community/podcast" />
          <div className="space-y-3">
            {episodes.map((e) => (
              <Link
                key={e.id}
                href="/community/podcast"
                className="flex items-center gap-3 rounded-2xl border border-surface-line bg-paper p-4 hover:shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-cyan text-white">
                  <Icon name="podcast" size={18} />
                </span>
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold text-navy">{e.title}</p>
                  <p className="text-xs text-muted">
                    {e.guest ? `${e.guest} · ` : ""}
                    {formatDate(e.publishedAt, locale)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
