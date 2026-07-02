import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n/server";
import { formatDate } from "@/lib/format";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { Icon } from "@/components/icons";
import { Stagger, StaggerItem } from "@/components/motion";

export default async function PodcastPage() {
  const { locale, dict } = await getDict();
  const P = dict.community.podcast;
  const episodes = await prisma.podcastEpisode.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <SpaceHeader icon="podcast" title={P.title} />
      <SpaceBanner />

      {episodes.length === 0 ? (
        <Empty text={P.empty} />
      ) : (
        <Stagger className="grid gap-5 sm:grid-cols-2">
          {episodes.map((e) => (
            <StaggerItem
              key={e.id}
              className="overflow-hidden rounded-2xl border border-surface-line bg-paper transition-shadow hover:shadow-md"
            >
              <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-navy via-navy-700 to-cyan">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-navy">
                  <Icon name="podcast" size={22} />
                </span>
                {e.episode != null && (
                  <span className="absolute left-3 top-3 rounded-full bg-black/25 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {P.episode} {e.episode}
                  </span>
                )}
                {e.duration && (
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/30 px-2 py-0.5 text-xs text-white">
                    {e.duration}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-bold leading-snug text-navy">{e.title}</h2>
                {e.guest && <p className="mt-1 text-sm text-cyan">{e.guest}</p>}
                <p className="mt-2 line-clamp-2 text-sm text-muted">{e.description}</p>
                <p className="mt-3 text-xs text-muted">
                  {formatDate(e.publishedAt, locale)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-line bg-paper p-12 text-center text-muted">
      {text}
    </div>
  );
}
