import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n/server";
import { INTELLIGENCES } from "@/lib/constants";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Stagger, StaggerItem } from "@/components/motion";

export default async function ChaptersPage() {
  const { locale, dict } = await getDict();
  const C = dict.community.chapters;

  const chapters = await prisma.chapter.findMany({
    include: { country: true },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });

  const statusMeta = (s: string) =>
    s === "ACTIVE"
      ? { label: C.active, tone: "green" as const }
      : s === "GRADUATED"
        ? { label: C.graduated, tone: "navy" as const }
        : { label: C.recruiting, tone: "neutral" as const };

  return (
    <div>
      <SpaceHeader icon="chapters" title={C.title} subtitle={C.subtitle} />
      <SpaceBanner label="GÉNESIS i7™" />

      <Stagger className="grid gap-5 md:grid-cols-2">
        {chapters.map((c) => {
          const st = statusMeta(c.status);
          const pct = Math.round((c.currentWeek / 7) * 100);
          const intel = INTELLIGENCES.find((i) => i.week === c.currentWeek);
          return (
            <StaggerItem
              key={c.id}
              className="flex flex-col rounded-2xl border border-surface-line bg-paper p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-navy">{c.name}</h2>
                  <p className="text-sm text-muted">
                    {c.country.flag} {c.city}, {c.country.name}
                    {c.stake ? ` · ${c.stake}` : ""}
                  </p>
                </div>
                <Badge tone={st.tone}>{st.label}</Badge>
              </div>

              {/* progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>
                    {C.week} {c.currentWeek} {C.of} 7
                  </span>
                  <span>{c.cohortSize} {C.cohort}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-200">
                  <div
                    className="h-full rounded-full bg-cyan"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {intel && c.status === "ACTIVE" && (
                  <p className="mt-2 text-xs text-cyan">
                    <Icon name="sparkles" size={13} className="-mt-0.5 inline" />{" "}
                    {locale === "es" ? intel.es : intel.en}
                  </p>
                )}
              </div>

              {c.story && (
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/80">{c.story}</p>
              )}
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
