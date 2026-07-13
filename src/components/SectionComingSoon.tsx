import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { NightSky } from "@/components/Constellation";
import { LinkButton, Badge, Kicker } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

/**
 * Placeholder for platform sections under construction (Padres, StarbizAcademy).
 * Designed empty state: shows what's coming and routes people to the live community.
 */
export async function SectionComingSoon({
  title,
  tag,
  lead,
  features,
  accent,
}: {
  title: string;
  tag: string;
  lead: string;
  features: ReadonlyArray<readonly string[]>;
  accent: "cyan" | "gold";
}) {
  const { dict } = await getDict();
  const S = dict.sections;
  return (
    <div className="container-ac flex-1 py-10 md:py-14">
      {/* Hero de sección en construcción */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-navy">
          <NightSky />
          <div className="relative px-6 py-12 text-center md:py-16">
            <Badge
              tone="neutral"
              className="border-gold/40 bg-gold/10 uppercase tracking-wide text-gold"
            >
              {S.soonBadge}
            </Badge>
            <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium uppercase tracking-[0.18em] text-cyan-bright">
              {tag}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-white/75">{lead}</p>
            <p className="mx-auto mt-6 max-w-lg text-sm text-white/55">{S.soonBody}</p>
            <div className="mt-8">
              <LinkButton href="/comunidad/posts" size="lg">
                {S.backToCommunity}
                <Icon name="arrowRight" size={17} />
              </LinkButton>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Lo que traerá esta sección */}
      <div className="mt-8">
        <Kicker>{S.soonTitle}</Kicker>
        <Stagger className="mt-4 grid gap-4 sm:grid-cols-2">
          {features.map(([name, desc]) => (
            <StaggerItem
              key={name}
              className="rounded-2xl border border-surface-line bg-paper p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/30 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span
                  className={
                    accent === "gold"
                      ? "animate-led mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold shadow-[0_0_8px_2px_rgba(251,191,36,0.6)]"
                      : "animate-led mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-bright shadow-[0_0_8px_2px_rgba(34,211,238,0.6)]"
                  }
                  aria-hidden
                />
                <div>
                  <p className="font-bold text-navy">{name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        <Link href="/comunidad/eventos" className="font-semibold text-cyan hover:underline">
          {dict.community.spaces.events}
        </Link>{" "}
        ·{" "}
        <Link href="/comunidad/tienda" className="font-semibold text-cyan hover:underline">
          {dict.nav.store}
        </Link>
      </p>
    </div>
  );
}
