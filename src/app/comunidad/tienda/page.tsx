import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n/server";
import { BRAND } from "@/lib/constants";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { Stagger, StaggerItem } from "@/components/motion";
import { ProductCard } from "@/components/store/ProductCard";
import { Icon } from "@/components/icons";
import type { Product } from "@prisma/client";
import type { Dict } from "@/lib/i18n/dictionaries";

function Section({ title, items, S }: { title: string; items: Product[]; S: Dict["store"] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="animate-led h-1.5 w-1.5 rounded-full bg-cyan-bright shadow-[0_0_8px_2px_rgba(34,211,238,0.6)]"
          aria-hidden
        />
        <h2 className="text-lg font-extrabold text-navy">{title}</h2>
      </div>
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <StaggerItem key={p.id} className="h-full">
            <ProductCard p={p} S={S} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export default async function CommunityStorePage() {
  const [{ dict }, products] = await Promise.all([
    getDict(),
    prisma.product.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
  ]);
  const S = dict.store;
  const apps = products.filter((p) => p.category === "APP");
  const services = products.filter((p) => p.category === "SERVICE");

  return (
    <div>
      <SpaceHeader
        icon="store"
        title={dict.community.spaces.store}
        subtitle={S.lead}
      />
      <SpaceBanner label={S.kicker} />

      {products.length === 0 ? (
        <p className="text-muted">{S.empty}</p>
      ) : (
        <>
          <Section title={S.apps} items={apps} S={S} />
          <Section title={S.services} items={services} S={S} />
        </>
      )}

      <div className="relative mt-10 overflow-hidden rounded-2xl bg-navy px-6 py-6">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-md text-sm text-white/85">{S.note}</p>
          <a
            href={BRAND.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-cyan px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-cyan-700 hover:shadow-md"
          >
            WhatsApp
            <Icon name="arrowRight" size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
