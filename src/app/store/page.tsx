import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n/server";
import { whatsappFor, BRAND } from "@/lib/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Kicker, Badge, cn } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Reveal, RevealSection, Stagger, StaggerItem } from "@/components/motion";
import type { Dict } from "@/lib/i18n/dictionaries";

type Product = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

function statusBadge(status: string, S: Dict["store"]) {
  switch (status) {
    case "AVAILABLE":
      return { label: S.available, tone: "green" as const };
    case "BETA":
      return { label: S.beta, tone: "cyan" as const };
    default:
      return { label: S.comingSoon, tone: "neutral" as const };
  }
}

function ProductCard({ p, S }: { p: Product; S: Dict["store"] }) {
  const badge = statusBadge(p.status, S);
  const soon = p.status === "COMING_SOON";
  const href = p.url || whatsappFor(p.name);
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/30 hover:shadow-lg",
        p.featured && "ring-1 ring-gold/60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl leading-none" aria-hidden>
          {p.icon ?? "⭐"}
        </span>
        <div className="flex items-center gap-1.5">
          {p.featured && <Badge tone="neutral" className="border-gold/40 bg-gold/10 text-gold-700">{S.featured}</Badge>}
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-bold text-navy">{p.name}</h3>
      <p className="mt-0.5 text-sm font-medium text-cyan-700">{p.tagline}</p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line-soft pt-4">
        <span className="text-sm font-semibold text-navy">{p.price ?? ""}</span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            soon
              ? "border border-navy/25 text-navy hover:bg-navy/[0.04]"
              : "bg-cyan text-white shadow-sm hover:bg-cyan-700",
          )}
        >
          {soon ? S.ctaSoon : p.url ? S.ctaInfo : S.cta}
          <Icon name="arrowRight" size={14} />
        </a>
      </div>
    </div>
  );
}

export default async function StorePage() {
  const [{ dict }, products] = await Promise.all([
    getDict(),
    prisma.product.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
  ]);
  const S = dict.store;
  const apps = products.filter((p) => p.category === "APP");
  const services = products.filter((p) => p.category === "SERVICE");

  const section = (title: string, items: Product[]) =>
    items.length > 0 && (
      <RevealSection className="container-ac py-10">
        <h2 className="text-2xl font-extrabold text-navy">{title}</h2>
        <Stagger className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard p={p} S={S} />
            </StaggerItem>
          ))}
        </Stagger>
      </RevealSection>
    );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <section className="container-ac pb-4 pt-16 md:pt-20">
        <Reveal>
          <Kicker>{S.kicker}</Kicker>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-navy sm:text-5xl">
            {S.title}
          </h1>
          <p className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-ink/85">
            {S.lead}
          </p>
        </Reveal>
      </section>

      {products.length === 0 ? (
        <div className="container-ac py-16">
          <p className="text-muted">{S.empty}</p>
        </div>
      ) : (
        <>
          {section(S.apps, apps)}
          {section(S.services, services)}
        </>
      )}

      <RevealSection className="container-ac py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-navy px-8 py-8">
          <p className="max-w-xl text-white/85">{S.note}</p>
          <a
            href={BRAND.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-cyan px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
          >
            WhatsApp
            <Icon name="arrowRight" size={15} />
          </a>
        </div>
      </RevealSection>

      <SiteFooter />
    </div>
  );
}
