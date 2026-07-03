import Image from "next/image";
import { getDict } from "@/lib/i18n/server";
import { INTELLIGENCES } from "@/lib/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LinkButton, Kicker, Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Reveal, RevealSection } from "@/components/motion";
import { NightSky, Constellation } from "@/components/Constellation";

export default async function LandingPage() {
  const { locale, dict } = await getDict();
  const L = dict.landing;
  const intelligenceLabels = INTELLIGENCES.map((i) => (locale === "es" ? i.es : i.en));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* ---------------- HERO — the GÉNESIS i7 night sky ---------------- */}
      <section className="relative overflow-hidden bg-navy">
        <NightSky />
        <div className="container-ac relative grid items-center gap-10 pb-4 pt-16 md:grid-cols-[1.15fr_0.85fr] md:pb-6 md:pt-24">
          <div>
            <Reveal>
              <Kicker className="text-gold">{L.kicker}</Kicker>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl [text-wrap:balance]">
                {L.h1a}
                <br />
                <span className="text-cyan-bright">{L.h1b}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-md font-serif text-lg leading-relaxed text-white/75">
                {L.lead}
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/community" size="lg">
                  {L.ctaCommunity}
                  <Icon name="arrowRight" size={18} />
                </LinkButton>
                <LinkButton href="#genesis" size="lg" variant="outlineLight">
                  {L.ctaMethod}
                </LinkButton>
              </div>
            </Reveal>
          </div>

          {/* Floating brand mark */}
          <Reveal delay={0.2} className="hidden md:block">
            <Image
              src="/logo.png"
              alt="StarbizAcademy Community"
              width={360}
              height={360}
              priority
              className="animate-float mx-auto w-[76%] max-w-[360px] rounded-3xl ring-1 ring-white/10 drop-shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
            />
          </Reveal>
        </div>

        {/* The methodology, drawn as a constellation */}
        <div className="container-ac relative pb-8 pt-4 md:pb-10">
          <Constellation labels={intelligenceLabels} />
        </div>
      </section>

      {/* ---------------- TWO PILLARS ---------------- */}
      <RevealSection className="container-ac py-16">
        <Kicker>{L.pillarsKicker}</Kicker>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-paper p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/30 hover:shadow-lg">
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
          <div className="rounded-2xl border border-line bg-paper p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg">
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
              <h2 className="mt-2 text-3xl font-extrabold text-navy sm:text-4xl">
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
                  className="inline-flex cursor-default items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-sm text-navy ring-1 ring-line transition-colors duration-200 hover:bg-navy hover:text-white hover:ring-navy"
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
      <RevealSection className="relative mt-8 overflow-hidden bg-navy">
        <NightSky />
        <div className="container-ac relative py-16 text-center">
          <Kicker className="text-gold">{L.familyPassKicker}</Kicker>
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            {L.familyPassTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/75">{L.familyPassBody}</p>
          <p className="mx-auto mt-8 max-w-3xl font-serif text-2xl leading-snug text-white sm:text-3xl">
            {L.promise.split(":")[0]}:{" "}
            <span className="italic text-cyan-bright">{L.promise.split(":")[1]}</span>
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
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
