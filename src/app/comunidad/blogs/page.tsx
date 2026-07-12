import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n/server";
import { formatDate, readMinutes } from "@/lib/format";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Stagger, StaggerItem } from "@/components/motion";

const CAT: Record<string, { en: string; es: string }> = {
  OPPORTUNITY: { en: "Opportunity", es: "Oportunidad" },
  SPIRITUAL: { en: "Spiritual", es: "Espiritual" },
  MENTAL: { en: "Mindset", es: "Mentalidad" },
  PHYSICAL: { en: "Physical", es: "Física" },
  EMOTIONAL: { en: "Emotional", es: "Emocional" },
  SOCIAL: { en: "Social", es: "Social" },
  FINANCIAL: { en: "Financial", es: "Finanzas" },
  TECH: { en: "Tech", es: "Tecnología" },
};

/** Editorial cover: real image when set, branded gradient otherwise. */
function Cover({ cover, className }: { cover: string | null; className?: string }) {
  if (cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={cover} alt="" className={`${className} object-cover`} />;
  }
  return (
    <div
      className={`${className} bg-gradient-to-br from-navy via-navy-700 to-cyan-700`}
      aria-hidden
    >
      <div className="flex h-full items-center justify-center">
        <Icon name="fileText" size={34} className="text-white/40" />
      </div>
    </div>
  );
}

export default async function BlogsPage() {
  const { locale, dict } = await getDict();
  const B = dict.community.blogs;
  const posts = await prisma.observatoryPost.findMany({
    orderBy: { publishedAt: "desc" },
  });

  const [featured, ...rest] = posts;

  return (
    <div>
      <SpaceHeader icon="fileText" title={B.title} subtitle={B.subtitle} />
      <SpaceBanner />

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-line bg-paper p-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-cyan">
            <Icon name="fileText" size={20} />
          </span>
          <p className="mt-3 text-muted">{B.empty}</p>
        </div>
      ) : (
        <>
          {/* Artículo destacado a ancho completo */}
          <Link
            href={`/comunidad/blogs/${featured.slug}`}
            className="group mb-6 block overflow-hidden rounded-2xl border border-surface-line bg-paper transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/30 hover:shadow-lg"
          >
            <div className="grid md:grid-cols-[1.1fr_1fr]">
              <Cover cover={featured.cover} className="h-48 w-full md:h-full" />
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2.5">
                  <span
                    className="animate-led h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_2px_rgba(251,191,36,0.6)]"
                    aria-hidden
                  />
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan">
                    {B.featured}
                  </p>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold leading-tight text-navy group-hover:text-cyan-700">
                  {featured.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-muted">
                  {featured.summary}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
                  {CAT[featured.category] && (
                    <Badge tone="cyan">
                      {locale === "es" ? CAT[featured.category].es : CAT[featured.category].en}
                    </Badge>
                  )}
                  <span>
                    {readMinutes(featured.body)} {B.readTime}
                  </span>
                  <span>· {B.by} {featured.authors}</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Grid editorial */}
          <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rest.map((p) => (
              <StaggerItem key={p.id} className="h-full">
                <Link
                  href={`/comunidad/blogs/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-surface-line bg-paper transition-all duration-300 hover:-translate-y-1 hover:border-cyan/30 hover:shadow-lg"
                >
                  <Cover cover={p.cover} className="h-36 w-full" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      {CAT[p.category] && (
                        <Badge tone="cyan">
                          {locale === "es" ? CAT[p.category].es : CAT[p.category].en}
                        </Badge>
                      )}
                      <span>{formatDate(p.publishedAt, locale)}</span>
                    </div>
                    <h3 className="mt-2.5 font-bold leading-snug text-navy group-hover:text-cyan-700">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{p.summary}</p>
                    <p className="mt-3 text-xs text-muted">
                      {readMinutes(p.body)} {B.readTime} · {B.by} {p.authors}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </>
      )}
    </div>
  );
}
