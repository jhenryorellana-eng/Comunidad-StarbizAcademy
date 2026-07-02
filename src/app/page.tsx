import { getDict } from "@/lib/i18n/server";
import { INTELLIGENCES, BRAND } from "@/lib/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LinkButton, Kicker, Badge } from "@/components/ui";
import { StarGlyph } from "@/components/Star";
import { Icon } from "@/components/icons";
import { Reveal, RevealSection } from "@/components/motion";

export default async function LandingPage() {
  const { locale, dict } = await getDict();
  const L = dict.landing;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden">
        <div className="container-ac grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <Reveal>
            <Kicker>{L.kicker}</Kicker>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.04] tracking-tight text-navy sm:text-6xl">
              {L.h1a}
              <br />
              <span className="text-cyan">{L.h1b}</span>
            </h1>
            <p className="mt-6 max-w-md font-serif text-lg leading-relaxed text-ink/85">
              {L.lead}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton href="/community" size="lg">
                {L.ctaCommunity}
                <Icon name="arrowRight" size={18} />
              </LinkButton>
              <LinkButton href="#genesis" size="lg" variant="outline">
                {L.ctaMethod}
              </LinkButton>
            </div>
          </Reveal>

          {/* Brand visual card */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-navy via-navy-700 to-cyan-700 shadow-xl">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                <StarGlyph size={84} className="text-gold" />
                <p className="mt-5 font-display text-2xl font-extrabold uppercase tracking-[0.2em]">
                  Starbiz
                </p>
                <p className="font-display text-2xl font-light uppercase tracking-[0.3em]">
                  Academy
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.25em] text-white/55">
                  Est. {BRAND.est}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- TWO PILLARS ---------------- */}
      <RevealSection className="container-ac py-16">
        <Kicker>{L.pillarsKicker}</Kicker>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-paper p-7 transition-shadow hover:shadow-sm">
            <Badge tone="cyan">{L.pillar1Tag}</Badge>
            <h3 className="mt-4 text-2xl font-extrabold text-navy">{L.pillar1Title}</h3>
            <p className="mt-1.5 text-sm text-muted">{L.pillar1Desc}</p>
            <ul className="mt-5 space-y-2.5">
              {L.apps1.map(([name, desc]) => (
                <li key={name} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                  <span>
                    <span className="font-semibold text-navy">{name}</span>{" "}
                    <span className="text-muted">— {desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-paper p-7 transition-shadow hover:shadow-sm">
            <Badge tone="navy">{L.pillar2Tag}</Badge>
            <h3 className="mt-4 text-2xl font-extrabold text-navy">{L.pillar2Title}</h3>
            <p className="mt-1.5 text-sm text-muted">{L.pillar2Desc}</p>
            <ul className="mt-5 space-y-2.5">
              {L.apps2.map(([name, desc]) => (
                <li key={name} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>
                    <span className="font-semibold text-navy">{name}</span>{" "}
                    <span className="text-muted">— {desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </RevealSection>

      {/* ---------------- GÉNESIS i7 ---------------- */}
      <RevealSection className="container-ac py-16">
        <div id="genesis" className="rounded-3xl border border-line bg-cream-200/60 p-8 md:p-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Kicker>{L.genesisKicker}</Kicker>
              <h2 className="mt-2 text-4xl font-extrabold text-navy">
                {L.genesisTitle}
              </h2>
            </div>
            <Badge tone="cyan" className="px-4 py-1.5 text-sm">
              7 {locale === "es" ? "semanas" : "weeks"}
            </Badge>
          </div>

          <p className="mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-ink/80">
            “{L.genesisQuote}”
          </p>

          <div className="mt-9 border-t border-line pt-6">
            <p className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-muted">
              {L.weekLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {INTELLIGENCES.map((i) => (
                <span
                  key={i.week}
                  className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-sm text-navy ring-1 ring-line"
                >
                  <span className="font-semibold text-cyan">i{i.week}</span>
                  {locale === "es" ? i.es : i.en}
                </span>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ---------------- FAMILY PASS + PROMISE BAND ---------------- */}
      <RevealSection className="relative mt-8 bg-navy">
        <div className="container-ac py-16 text-center">
          <Kicker className="text-gold">{L.familyPassKicker}</Kicker>
          <h2 className="mt-4 text-4xl font-extrabold text-white">
            {L.familyPassTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/75">{L.familyPassBody}</p>
          <p className="mx-auto mt-8 max-w-3xl font-serif text-2xl leading-snug text-white sm:text-3xl">
            {L.promise.split(":")[0]}:{" "}
            <span className="italic text-cyan-bright">{L.promise.split(":")[1]}</span>
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <LinkButton href="/community" size="lg">
              {L.ctaCommunity}
            </LinkButton>
            <LinkButton href="/signup" size="lg" variant="outlineLight">
              {dict.common.signup}
            </LinkButton>
          </div>
        </div>
      </RevealSection>

      <SiteFooter />
    </div>
  );
}
