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
  ecosystem,
}: {
  title: string;
  tag: string;
  lead: string;
  features: ReadonlyArray<readonly string[]>;
  accent: "cyan" | "gold";
  /**
   * Salida al ecosistema completo, fuera de esta plataforma.
   *
   * Cuando existe, pasa a ser la llamada PRINCIPAL y "Ir a la Comunidad" baja a
   * secundaria. Es lo correcto: a quien entra en una sección en construcción,
   * mandarlo de vuelta a la comunidad es un consuelo — mandarlo al sitio que ya
   * está en pie es una respuesta.
   */
  ecosystem?: { href: string; label: string };
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
            <div className="mt-8 flex flex-col items-center gap-3">
              {ecosystem ? (
                <>
                  <a
                    href={ecosystem.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    // El halo dorado y el barrido de luz sólo viven aquí. Es el
                    // único botón de la página que lleva a algo que YA existe:
                    // tiene que verse distinto a todo lo demás.
                    className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-gold-300 via-gold to-gold-300 px-8 py-3.5 font-display font-bold text-navy shadow-[0_0_0_1px_rgba(251,191,36,0.5),0_14px_40px_-8px_rgba(251,191,36,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(251,191,36,0.7),0_18px_50px_-8px_rgba(251,191,36,0.8)]"
                  >
                    <span
                      className="animate-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent"
                      aria-hidden
                    />
                    <Icon name="sparkles" size={17} />
                    <span className="relative">{ecosystem.label}</span>
                    <Icon
                      name="external"
                      size={14}
                      className="relative transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </a>
                  <Link
                    href="/comunidad/posts"
                    className="text-sm font-semibold text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {S.backToCommunity}
                  </Link>
                </>
              ) : (
                <LinkButton href="/comunidad/posts" size="lg">
                  {S.backToCommunity}
                  <Icon name="arrowRight" size={17} />
                </LinkButton>
              )}
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
