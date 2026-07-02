import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n/server";
import { formatDate } from "@/lib/format";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { Badge } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";

const CAT: Record<string, { en: string; es: string }> = {
  OPPORTUNITY: { en: "Opportunity", es: "Oportunidad" },
  EMOTIONAL: { en: "Emotional", es: "Emocional" },
  FINANCIAL: { en: "Financial", es: "Financiera" },
  MENTAL: { en: "Mental", es: "Mental" },
  SOCIAL: { en: "Social", es: "Social" },
  TECH: { en: "Tech", es: "Tecnología" },
};

export default async function ObservatoryPage() {
  const { locale, dict } = await getDict();
  const O = dict.community.observatory;
  const posts = await prisma.observatoryPost.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <SpaceHeader icon="observatory" title={O.title} subtitle={O.subtitle} />
      <SpaceBanner label="StarBooks · Mentalidad Acelerada" />

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-line bg-paper p-12 text-center text-muted">
          {O.empty}
        </div>
      ) : (
        <Stagger className="space-y-4">
          {posts.map((p) => {
            const cat = CAT[p.category];
            return (
              <StaggerItem
                key={p.id}
                className="rounded-2xl border border-surface-line bg-paper p-6"
              >
                <div className="mb-2 flex items-center gap-3">
                  {cat && <Badge tone="cyan">{locale === "es" ? cat.es : cat.en}</Badge>}
                  <span className="text-xs text-muted">
                    {formatDate(p.publishedAt, locale)}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-navy">{p.title}</h2>
                <p className="mt-1 text-sm text-muted">
                  {O.by} {p.authors}
                </p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/85">
                  {p.summary}
                </p>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
