import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n/server";
import { formatDate } from "@/lib/format";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { PlayEpisodeButton } from "@/components/community/PodcastPlayer";
import { Icon } from "@/components/icons";
import { Stagger, StaggerItem } from "@/components/motion";

// El menú dice "Podcast" (funcional); StarVoice es el nombre del programa y
// aparece como título dentro de la página.
export default async function PodcastPage() {
  const { locale, dict } = await getDict();
  const P = dict.community.podcast;
  const episodes = await prisma.podcastEpisode.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <SpaceHeader icon="podcast" title={P.title} />
      <SpaceBanner label="StarVoice · Combustible Diario" />

      {episodes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-line bg-paper p-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-cyan">
            <Icon name="podcast" size={20} />
          </span>
          <p className="mt-3 text-muted">{P.empty}</p>
        </div>
      ) : (
        <Stagger className="space-y-3">
          {episodes.map((e) => (
            <StaggerItem
              key={e.id}
              className="group flex flex-col gap-4 rounded-2xl border border-surface-line bg-paper p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/30 hover:shadow-md sm:flex-row sm:items-center"
            >
              {/* Ícono de micrófono */}
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy via-navy-700 to-cyan text-white">
                <Icon name="podcast" size={24} />
                {e.episode != null && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] font-bold text-navy">
                    {e.episode}
                  </span>
                )}
              </div>

              {/* título · autor · fecha · duración */}
              <div className="min-w-0 flex-1">
                <h2 className="font-bold leading-snug text-navy">{e.title}</h2>
                <p className="mt-0.5 text-sm text-muted">
                  {e.guest && <span className="text-cyan-700">{e.guest} · </span>}
                  {formatDate(e.publishedAt, locale)}
                  {e.duration ? ` · ${e.duration}` : ""}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{e.description}</p>
              </div>

              {/* play → reproductor persistente al pie */}
              <div className="shrink-0">
                <PlayEpisodeButton
                  episode={{
                    id: e.id,
                    title: e.title,
                    guest: e.guest,
                    duration: e.duration,
                    audioUrl: e.audioUrl,
                  }}
                />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
