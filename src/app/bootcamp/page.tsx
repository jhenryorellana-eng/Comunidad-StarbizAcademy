import type { Metadata } from "next";
import Image from "next/image";
import { getDict } from "@/lib/i18n/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTabs } from "@/components/SectionTabs";
import { CountdownInline } from "@/components/bootcamp/Countdown";
import { CheckoutButton } from "@/components/bootcamp/CheckoutButton";
import { stripeEnabled } from "@/lib/stripe";
import { Icon } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/components/ui";
import { whatsappFor } from "@/lib/constants";
import {
  BOOTCAMP,
  BOOTCAMP_DAYS,
  BOOTCAMP_INCLUDES,
  BOOTCAMP_TIMELINE,
  BOOTCAMP_MEDIA,
} from "@/lib/bootcamp";

export const metadata: Metadata = {
  title: "Bootcamp Utah 2027 — StarbizAcademy",
  description:
    "4 días y 5 noches en Utah, del 26 al 31 de enero de 2027. Universidades, Silicon Slopes, los siete profesionales de GÉNESIS i7™ y la ceremonia Star App.",
  openGraph: {
    title: "Bootcamp Utah 2027 — StarbizAcademy",
    description:
      "4 días y 5 noches en Utah. Universidades, Silicon Slopes, GÉNESIS i7™ y la ceremonia Star App. Inscripción $250 con carta de invitación incluida.",
    images: [{ url: "/og-image.jpg", width: 1024, height: 1024, alt: "Bootcamp Utah 2027" }],
  },
};

const WA_RESERVE = whatsappFor("el Bootcamp Utah 2027 — quiero reservar mi cupo");
const WA_ASK = whatsappFor("el Bootcamp Utah 2027 — tengo una pregunta");

/* Cielo nocturno reutilizable: estrellas fijas + dos cometas de marca. */
function NightSky() {
  const stars = [
    { l: "6%", t: "18%", s: 2 },
    { l: "17%", t: "62%", s: 1.5 },
    { l: "28%", t: "28%", s: 2.5 },
    { l: "41%", t: "74%", s: 1.5 },
    { l: "55%", t: "16%", s: 2 },
    { l: "68%", t: "58%", s: 1.5 },
    { l: "79%", t: "31%", s: 2.5 },
    { l: "90%", t: "68%", s: 2 },
    { l: "95%", t: "22%", s: 1.5 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((st, i) => (
        <span
          key={i}
          className="star-halo"
          style={
            {
              left: st.l,
              top: st.t,
              width: st.s,
              height: st.s,
              "--halo-period": `${4 + (i % 4)}s`,
              "--halo-delay": `${i * 0.4}s`,
              "--halo-color": i % 3 === 0 ? "rgba(251,191,36,0.9)" : "rgba(34,211,238,0.9)",
            } as React.CSSProperties
          }
        />
      ))}
      <span
        className="comet left-[-12%] top-[22%]"
        style={
          {
            "--comet-angle": "18deg",
            "--comet-period": "13s",
            "--comet-color": "rgba(34,211,238,0.95)",
            "--comet-glow": "rgba(34,211,238,0.7)",
          } as React.CSSProperties
        }
      />
      <span
        className="comet left-[-12%] top-[64%]"
        style={
          {
            "--comet-angle": "-12deg",
            "--comet-period": "17s",
            "--comet-delay": "5s",
            "--comet-color": "rgba(251,191,36,0.95)",
            "--comet-glow": "rgba(251,191,36,0.6)",
          } as React.CSSProperties
        }
      />
    </div>
  );
}

export default async function BootcampPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string }>;
}) {
  const { dict, locale } = await getDict();
  const B = dict.bootcamp;
  const includes = BOOTCAMP_INCLUDES[locale];
  const { pago } = await searchParams;
  const pagoCancelado = pago === "cancelado";

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader mobileMenu nav={false} />
      <SectionTabs />

      {/* Vuelta de un pago cancelado. Sin alarma: no se le ha cobrado nada y el
          cupo sigue ahí. Sólo hace falta decírselo. */}
      {pagoCancelado && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="container-ac flex items-start gap-2.5 py-3 text-sm">
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/30 text-amber-700">
              <Icon name="clock" size={12} />
            </span>
            {/* Frase e enlace en el mismo párrafo: en móvil, separarlos dejaba
                el icono solo en una línea y el aviso parecía tres bloques. */}
            <p className="text-amber-900">
              {B.payCancelled}{" "}
              <a
                href="#inscripcion"
                className="whitespace-nowrap font-semibold underline underline-offset-2"
              >
                {B.payRetry}
              </a>
            </p>
          </div>
        </div>
      )}

      {/* ====================== PORTADA ======================
          Antes la foto iba al 45% bajo un velo navy: la imagen más bonita de
          la pieza, enterrada. Y encima siete bloques apilados del mismo tamaño.
          Sin contraste de escala no hay impacto.

          Ahora la imagen va a plena fuerza y ocupa casi toda la pantalla. El
          velo ya no es uniforme: cae SOLO donde vive el texto —arriba en móvil,
          a la izquierda en escritorio—, que es justo la zona que las dos
          ilustraciones dejaron despejada a propósito. Así las montañas se ven.

          El texto se queda en lo imprescindible: gancho, promesa, escasez y UNA
          llamada. Fechas y cuenta atrás bajan a la banda de datos: son hechos,
          no el anzuelo. */}
      <section className="relative flex min-h-[88vh] flex-col overflow-hidden bg-navy text-white sm:min-h-[80vh]">
        {BOOTCAMP_MEDIA.hero && (
          <>
            <Image
              src={BOOTCAMP_MEDIA.hero.srcMobile}
              alt={BOOTCAMP_MEDIA.hero.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-bottom sm:hidden"
            />
            <Image
              src={BOOTCAMP_MEDIA.hero.src}
              alt=""
              aria-hidden
              fill
              priority
              sizes="100vw"
              className="hidden object-cover sm:block"
            />
            {/* Velo direccional: denso donde va el texto, transparente donde
                está el paisaje. En móvil cae de arriba; en escritorio, de la
                izquierda. */}
            <div
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,24,0.93)_0%,rgba(6,10,24,0.78)_38%,rgba(6,10,24,0.25)_70%,rgba(6,10,24,0.05)_100%)] sm:bg-[linear-gradient(100deg,rgba(6,10,24,0.94)_0%,rgba(6,10,24,0.8)_38%,rgba(6,10,24,0.25)_72%,rgba(6,10,24,0)_100%)]"
              aria-hidden
            />
          </>
        )}
        <NightSky />

        <div className="container-ac relative flex flex-1 flex-col justify-start pb-10 pt-10 sm:justify-center sm:py-16">
          <div className="max-w-xl">
            <p className="kicker text-gold">{B.kicker}</p>

            {/* Escala: el titular es lo único grande de la pantalla. */}
            <h1 className="mt-3 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-white [text-wrap:balance] sm:text-6xl lg:text-7xl">
              {B.title}
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
              {B.lead}
            </p>

            {/* Escasez: lo único que acompaña al titular. */}
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-navy">
                <Icon name="star" size={12} />
                {B.feedSeats}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-navy/40 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-gold backdrop-blur-md">
                <Icon name="clock" size={12} />
                {B.feedDeadline}
              </span>
            </div>

            {/* UNA llamada. Si Stripe está configurado abre el pago; si no,
                cae a WhatsApp, así la página nunca queda sin salida. */}
            <div className="mt-7">
              {stripeEnabled ? (
                <CheckoutButton label={B.ctaPrimary} />
              ) : (
                <a
                  href={WA_RESERVE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-semibold text-navy shadow-[0_10px_34px_rgba(251,191,36,0.4)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-300"
                >
                  {B.ctaPrimary}
                  <Icon name="arrowRight" size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        <span
          className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-cyan-bright/0 via-cyan-bright to-gold"
          aria-hidden
        />
      </section>

      {/* --------- Banda de datos: los hechos, ya sin robar protagonismo --------- */}
      <section className="border-b border-white/10 bg-navy-800 text-white">
        <div className="container-ac flex flex-col gap-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {[
              { icon: "events" as const, text: B.dates },
              { icon: "clock" as const, text: B.daysNights },
              { icon: "pin" as const, text: B.place },
            ].map((d) => (
              <span key={d.text} className="inline-flex items-center gap-2 text-white/80">
                <Icon name={d.icon} size={14} className="text-cyan-bright" />
                {d.text}
              </span>
            ))}
          </div>

          {/* Cuenta atrás compacta: a 185 días, cuatro fichas grandes ocupaban
              la mejor zona de la página sin transmitir urgencia. */}
          <div className="flex items-center gap-2.5">
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/40">
              {B.tMinus}
            </span>
            <CountdownInline />
          </div>
        </div>
      </section>

      {/* ================== ITINERARIO ==================
          Cada día es un DÍPTICO: la misma escena dos veces, ilustrada y
          fotografiada. La foto es la prueba —el padre proyecta a su hijo ahí—
          y la ilustración, encajada en una esquina, es el concepto. Antes la
          ilustración iba de fondo al 7% y sencillamente no se veía.

          El ritmo alterna lado en escritorio para que no se lea como una lista,
          y el día 3 ROMPE la retícula a sangre completa: es "el corazón del
          programa", así que interrumpe físicamente en vez de anunciarse con una
          etiqueta. */}
      <section className="py-14 sm:py-20">
        <div className="container-ac">
          <Reveal>
            <p className="kicker">{B.itineraryTitle}</p>
            <h2 className="mt-2 max-w-2xl font-display text-2xl font-bold sm:text-3xl">
              {B.itineraryLead}
            </h2>
          </Reveal>
        </div>

        <div className="mt-10 space-y-14 sm:mt-14 lg:space-y-24">
          {/* El lado alterna contando SÓLO los días con díptico: si contara
              también el protagonista —que va a sangre y sin lado—, el día 4
              repetiría lado con el día 2. Así el ritmo es izq · der · banda · izq. */}
          {BOOTCAMP_DAYS.map((day, i) => {
            const copy = day[locale];
            const flip =
              BOOTCAMP_DAYS.slice(0, i).filter((d) => !d.hero).length % 2 === 1;

            /* ---------- DÍA PROTAGONISTA: banda a sangre ---------- */
            if (day.hero) {
              return (
                <Reveal key={day.n}>
                  <div className="relative overflow-hidden bg-navy">
                    {day.photo && (
                      <Image
                        src={day.photo.src}
                        alt={day.photo.alt}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    )}
                    {/* Velo desde la izquierda: el ventanal de la foto está a la
                        derecha, así que el texto se apoya en la zona oscura. */}
                    <div
                      className="absolute inset-0 bg-[linear-gradient(100deg,rgba(6,10,24,0.95)_0%,rgba(6,10,24,0.82)_42%,rgba(6,10,24,0.35)_72%,rgba(6,10,24,0.15)_100%)]"
                      aria-hidden
                    />

                    <div className="container-ac relative py-14 sm:py-20 lg:py-28">
                      <div className="max-w-xl">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-navy shadow-[0_0_24px_5px_rgba(251,191,36,0.4)]">
                            <Icon name="star" size={19} />
                          </span>
                          <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-gold">
                            {B.dayLabel} {day.n}
                          </span>
                          <span className="text-sm text-white/55">
                            {locale === "es" ? day.dayEs : day.dayEn}
                          </span>
                        </div>

                        <span className="mt-4 inline-block rounded-full bg-gold px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide text-navy">
                          {B.heartLabel}
                        </span>

                        <h3 className="mt-3 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                          {copy.title}
                        </h3>
                        <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
                          {copy.lead}
                        </p>

                        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                          {copy.stops.map((stop) => (
                            <li
                              key={stop.name}
                              className="rounded-xl border border-white/15 bg-white/[0.07] p-3.5 backdrop-blur-md"
                            >
                              <p className="font-semibold text-white">{stop.name}</p>
                              <p className="mt-1 text-sm leading-snug text-white/60">
                                {stop.note}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <span
                      className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-gold via-gold-300 to-cyan-bright"
                      aria-hidden
                    />
                  </div>
                </Reveal>
              );
            }

            /* ---------- DÍAS NORMALES: díptico alterno ---------- */
            return (
              <Reveal key={day.n}>
                <div className="container-ac">
                  <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                    {/* --- Bloque de imagen: foto grande + ilustración encajada --- */}
                    <div className={cn("relative", flip && "lg:order-2")}>
                      {day.photo && (
                        <div className="relative overflow-hidden rounded-3xl shadow-[0_20px_50px_-20px_rgba(26,39,68,0.45)]">
                          <Image
                            src={day.photo.src}
                            alt={day.photo.alt}
                            width={1376}
                            height={768}
                            sizes="(min-width: 1024px) 580px, 100vw"
                            className="aspect-[3/2] w-full object-cover sm:aspect-[16/10]"
                          />
                          <span
                            className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-cyan-bright via-cyan to-gold"
                            aria-hidden
                          />
                        </div>
                      )}

                      {/* La ilustración: misma escena, versión concepto. El anillo
                          del color de la página la despega de la foto. */}
                      {day.art && (
                        <div
                          className={cn(
                            "absolute -bottom-5 w-[38%] max-w-[190px] overflow-hidden rounded-2xl ring-[6px] ring-surface sm:-bottom-7",
                            flip ? "-right-3 sm:-right-5" : "-left-3 sm:-left-5",
                          )}
                        >
                          <Image
                            src={day.art.src}
                            alt=""
                            aria-hidden
                            width={1376}
                            height={768}
                            sizes="(min-width: 1024px) 200px, 40vw"
                            className="aspect-[16/10] w-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* --- Bloque de texto --- */}
                    <div className={cn("pt-6 lg:pt-0", flip && "lg:order-1")}>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        {/* Numeral fantasma: sustituye al riel de constelación en
                            escritorio y da jerarquía sin ocupar sitio. */}
                        <span
                          className="font-display text-4xl font-extrabold leading-none text-cyan/20 sm:text-5xl"
                          aria-hidden
                        >
                          {String(day.n).padStart(2, "0")}
                        </span>
                        <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cyan">
                          {B.dayLabel} {day.n}
                        </span>
                        <span className="text-sm text-muted">
                          {locale === "es" ? day.dayEs : day.dayEn}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
                        {copy.title}
                      </h3>
                      <p className="mt-3 max-w-[38rem] leading-relaxed text-ink/85">
                        {copy.lead}
                      </p>

                      <p className="mb-3 mt-7 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted">
                        {B.stopsLabel}
                      </p>
                      <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        {copy.stops.map((stop) => (
                          <li
                            key={stop.name}
                            className="rounded-xl border border-surface-line bg-paper p-3.5 transition-colors hover:border-cyan/30"
                          >
                            <p className="font-semibold text-navy">{stop.name}</p>
                            <p className="mt-1 text-sm leading-snug text-muted">
                              {stop.note}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- Inscripción: qué cubre y qué no ---------------- */}
      <section
        id="inscripcion"
        className="scroll-mt-24 border-y border-surface-line bg-paper py-14 sm:py-20"
      >
        <div className="container-ac">
          <Reveal className="max-w-2xl">
            <p className="kicker">{B.priceKicker}</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
              {B.priceTitle}
            </h2>
            <p className="mt-3 leading-relaxed text-ink/85">{B.priceLead}</p>
          </Reveal>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            <Reveal className="rounded-2xl border border-cyan/25 bg-cyan-50/50 p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                <Icon name="check" size={18} className="text-cyan" />
                {B.includedTitle}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {includes.included.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-snug text-ink">
                    <Icon
                      name="check"
                      size={15}
                      className="mt-0.5 shrink-0 text-cyan"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1} className="rounded-2xl border border-surface-line bg-surface p-6">
              <h3 className="font-display text-lg font-bold text-muted">
                {B.excludedTitle}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {includes.excluded.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-snug text-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted/50" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* La decisión se toma aquí, leyendo qué cubre y qué no. Dejar esta
              sección sin salida obligaba a subir de nuevo a la portada. */}
          <Reveal
            delay={0.15}
            className="mt-6 flex flex-col items-start gap-5 rounded-2xl border border-gold/40 bg-gradient-to-br from-navy to-navy-800 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7"
          >
            <div>
              <p className="font-display text-2xl font-extrabold leading-none sm:text-3xl">
                ${BOOTCAMP.priceUSD}{" "}
                <span className="align-middle text-sm font-semibold text-white/60">USD</span>
              </p>
              <p className="mt-2 max-w-sm text-sm leading-snug text-white/70">
                {B.feedPriceNote}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2">
              {stripeEnabled ? (
                <CheckoutButton label={B.payNow} />
              ) : (
                <a
                  href={WA_RESERVE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-semibold text-navy shadow-[0_10px_34px_rgba(251,191,36,0.4)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-300"
                >
                  {B.ctaPrimary}
                  <Icon name="arrowRight" size={16} />
                </a>
              )}
              <p className="flex items-center gap-1.5 text-[0.7rem] text-white/50">
                <Icon name="lock" size={11} />
                {B.paySecure}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Línea de tiempo del trámite ---------------- */}
      <section className="container-ac py-14 sm:py-20">
        <Reveal className="max-w-2xl">
          <p className="kicker">{B.timelineTitle}</p>
          <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{B.timelineLead}</h2>
        </Reveal>

        <Stagger className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOOTCAMP_TIMELINE.map((s) => {
            const copy = s[locale];
            return (
              <StaggerItem key={s.step}>
                <div
                  className={cn(
                    "h-full rounded-2xl border p-5 transition-all duration-300",
                    s.critical
                      ? "border-gold/45 bg-gold/[0.07] shadow-[0_8px_28px_rgba(251,191,36,0.12)]"
                      : "border-surface-line bg-paper hover:border-cyan/25",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold",
                        s.critical ? "bg-gold text-navy" : "bg-navy text-white",
                      )}
                    >
                      {s.step}
                    </span>
                    <span
                      className={cn(
                        "text-[0.65rem] font-bold uppercase tracking-[0.14em]",
                        s.critical ? "text-gold-700" : "text-cyan",
                      )}
                    >
                      {copy.when}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold">{copy.title}</h3>
                  <p className="mt-1.5 text-sm leading-snug text-muted">{copy.body}</p>
                  {s.critical && (
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-gold-700">
                      <Icon name="flag" size={11} />
                      {B.criticalLabel}
                    </p>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal className="mt-6">
          <p className="text-xs text-muted">{B.guideDatesNote}</p>
        </Reveal>
      </section>

      {/* ---------------- Cierre ---------------- */}
      <section className="relative overflow-hidden bg-navy py-14 text-white sm:py-20">
        {BOOTCAMP_MEDIA.closing && (
          <>
            <Image
              src={BOOTCAMP_MEDIA.closing.src}
              alt={BOOTCAMP_MEDIA.closing.alt}
              fill
              sizes="100vw"
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-navy/70" aria-hidden />
          </>
        )}
        <NightSky />
        <div className="container-ac relative text-center">
          <Reveal>
            <p className="kicker text-gold">{BOOTCAMP.name}</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-2xl font-extrabold text-white sm:text-4xl">
              {B.title}
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {stripeEnabled ? (
                <CheckoutButton label={B.ctaPrimary} />
              ) : (
                <a
                  href={WA_RESERVE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 font-semibold text-navy shadow-[0_8px_28px_rgba(251,191,36,0.35)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-300"
                >
                  {B.ctaPrimary}
                  <Icon name="arrowRight" size={16} />
                </a>
              )}
              <a
                href={WA_ASK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 font-medium text-white backdrop-blur-md transition-all hover:bg-white/[0.18]"
              >
                {B.ctaSecondary}
              </a>
            </div>
            <p className="mt-5 text-sm text-white/50">{B.ctaFootnote}</p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
