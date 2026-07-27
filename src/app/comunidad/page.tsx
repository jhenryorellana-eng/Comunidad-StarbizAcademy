import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getSpaceCounts } from "@/lib/communityData";
import { PLATFORM_TREE } from "@/lib/constants";
import { BOOTCAMP } from "@/lib/bootcamp";
import { CountdownInline } from "@/components/bootcamp/Countdown";
import { Icon, type IconName } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { cn } from "@/components/ui";

/**
 * INICIO de la Comunidad.
 *
 * Antes esta ruta era un `redirect` a /comunidad/posts: quien llegaba desde la
 * portada aterrizaba en un feed de conversaciones sin saber dónde estaba ni por
 * qué debería quedarse. Un feed convence a quien YA entendió el proyecto; no
 * sirve para explicarlo.
 *
 * Esta página tiene UN trabajo: que un padre que llega por primera vez entienda
 * qué es esto, qué gana su hijo, y cree la cuenta. Todo lo demás está a un clic,
 * pero el hilo conductor es ese.
 *
 * El orden no es arbitrario: promesa → por qué existimos → qué se abre al
 * unirte → el bootcamp → dónde está cada cosa → cómo empezar. Los beneficios
 * van ANTES del mapa de espacios a propósito: a quien todavía no ve el valor no
 * le interesa saber dónde está cada cosa.
 *
 * Y todo se adapta a si ya entró. Enseñarle "Únete gratis" a alguien que ya
 * tiene cuenta es decirle que no sabemos quién es.
 */
export default async function ComunidadInicio() {
  const [{ dict }, user, counts] = await Promise.all([
    getDict(),
    getCurrentUser(),
    getSpaceCounts(),
  ]);
  const H = dict.community.home;
  const dentro = Boolean(user);

  const comunidad = PLATFORM_TREE.find((s) => s.key === "comunidad");
  // Ni Inicio (es esta página) ni Bootcamp (tiene su propio bloque, mucho más
  // grande, unas líneas más abajo).
  const espacios = (comunidad?.children ?? []).filter(
    (h) => h.key !== "home" && h.key !== "bootcamp",
  );

  return (
    <div className="flex flex-col gap-5">
      {/* ═══════════ PORTADA ═══════════
          El único bloque en navy y a sangre. Contraste de escala: si todo pesa
          lo mismo, no pesa nada. */}
      <Reveal className="relative overflow-hidden rounded-3xl bg-[linear-gradient(152deg,#12203c_0%,#0d1830_48%,#0a1020_100%)] px-6 py-9 text-white shadow-[0_18px_50px_rgba(26,39,68,0.28)] sm:px-9 sm:py-12">
        {/* Atmósfera en degradados, no en capas con filtro: forma parte de la
            textura y no cuesta un repintado por fotograma. */}
        <span
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_0%_100%,rgba(34,211,238,0.18),transparent_62%),radial-gradient(70%_50%_at_100%_0%,rgba(251,191,36,0.14),transparent_60%)]"
          aria-hidden
        />
        <div className="relative">
          <p className="kicker text-gold">{dentro ? H.welcomeBack : H.kicker}</p>
          <h1 className="mt-3 max-w-[22ch] font-display text-[1.9rem] font-extrabold leading-[1.08] tracking-tight text-white [text-wrap:balance] sm:text-[2.6rem]">
            {H.title}
          </h1>
          <p className="mt-4 max-w-lg text-[0.98rem] leading-relaxed text-white/70 sm:text-lg">
            {H.lead}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={dentro ? "/comunidad/posts" : "/signup"}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-navy shadow-[0_10px_30px_rgba(251,191,36,0.35)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-300"
            >
              {dentro ? H.ctaMember : H.ctaJoin}
              <Icon name="arrowRight" size={16} />
            </Link>
            <span className="text-xs text-white/45">
              {dentro ? H.ctaMemberNote : H.ctaJoinNote}
            </span>
          </div>
        </div>
        <span
          className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-cyan-bright via-cyan to-gold"
          aria-hidden
        />
      </Reveal>

      {/* ═══════════ POR QUÉ EXISTIMOS ═══════════ */}
      <section className="rounded-3xl border border-surface-line bg-paper p-6 sm:p-8">
        <Reveal>
          <p className="kicker">{H.purposeKicker}</p>
          <h2 className="mt-2 max-w-[26ch] font-display text-xl font-extrabold leading-tight text-navy [text-wrap:balance] sm:text-2xl">
            {H.purposeTitle}
          </h2>
          <p className="mt-3 max-w-[52ch] leading-relaxed text-ink/85">{H.purposeBody}</p>
        </Reveal>

        <Stagger className="mt-7 grid gap-3 sm:grid-cols-3">
          {H.pillars.map((p, i) => (
            <StaggerItem key={p.title}>
              <div className="h-full rounded-2xl border border-surface-line bg-surface p-4 transition-colors hover:border-cyan/25">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl text-white",
                    i === 0 ? "bg-cyan" : i === 1 ? "bg-gold text-navy" : "bg-navy",
                  )}
                >
                  <Icon
                    name={(["star", "members", "sparkles"] as IconName[])[i]}
                    size={15}
                  />
                </span>
                <p className="mt-3 font-display text-[0.95rem] font-bold text-navy">
                  {p.title}
                </p>
                <p className="mt-1.5 text-sm leading-snug text-muted">{p.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ═══════════ QUÉ SE ABRE AL UNIRTE ═══════════
          El corazón de la conversión, y por eso va antes del mapa de espacios.
          Cada beneficio es concreto y comprobable: nada de "acceso exclusivo a
          contenido premium", que no significa nada. */}
      <section
        className={cn(
          "rounded-3xl border p-6 sm:p-8",
          dentro
            ? "border-surface-line bg-paper"
            : "border-cyan/25 bg-gradient-to-br from-cyan-50/70 to-paper",
        )}
      >
        <Reveal>
          <p className="kicker">{H.benefitsKicker}</p>
          <h2 className="mt-2 font-display text-xl font-extrabold leading-tight text-navy sm:text-2xl">
            {H.benefitsTitle}
          </h2>
        </Reveal>

        <Stagger className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {H.benefits.map((b) => (
            <StaggerItem key={b.title}>
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan text-white">
                  <Icon name="check" size={13} />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[0.92rem] font-bold text-navy">
                    {b.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-snug text-muted">{b.body}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {!dentro && (
          <Reveal className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-cyan/15 pt-6">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 font-semibold text-white shadow-[0_10px_30px_rgba(26,39,68,0.25)] transition-all duration-200 hover:-translate-y-px hover:bg-navy-800"
            >
              {H.ctaJoin}
              <Icon name="arrowRight" size={16} />
            </Link>
            <span className="text-xs text-muted">{H.ctaJoinNote}</span>
          </Reveal>
        )}
      </section>

      {/* ═══════════ BOOTCAMP ═══════════ */}
      <Reveal className="relative overflow-hidden rounded-3xl border border-gold/40 bg-[linear-gradient(150deg,#1a2744_0%,#0d1830_100%)] p-6 text-white sm:p-8">
        <span
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_100%_0%,rgba(251,191,36,0.2),transparent_62%)]"
          aria-hidden
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="kicker text-gold">{H.bootcampKicker}</p>
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white/40">
              <CountdownInline />
            </span>
          </div>
          <h2 className="mt-2 max-w-[24ch] font-display text-xl font-extrabold leading-tight text-white sm:text-2xl">
            {H.bootcampTitle}
          </h2>
          <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-white/70">
            {H.bootcampBody}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-navy">
              <Icon name="star" size={11} />
              {BOOTCAMP.seats} cupos · ${BOOTCAMP.priceUSD}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-gold">
              <Icon name="clock" size={11} />
              {BOOTCAMP.deadlineEs}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/bootcamp#inscripcion"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 font-semibold text-navy shadow-[0_10px_30px_rgba(251,191,36,0.35)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-300"
            >
              {H.bootcampCta}
              <Icon name="arrowRight" size={15} />
            </Link>
            <Link
              href="/bootcamp"
              className="text-sm font-semibold text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              {H.bootcampMore}
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ═══════════ EL MAPA ═══════════ */}
      <section className="rounded-3xl border border-surface-line bg-paper p-6 sm:p-8">
        <Reveal>
          <p className="kicker">{H.spacesKicker}</p>
          <h2 className="mt-2 font-display text-xl font-extrabold leading-tight text-navy sm:text-2xl">
            {H.spacesTitle}
          </h2>
          <p className="mt-2 text-sm text-muted">{H.spacesLead}</p>
        </Reveal>

        <Stagger className="mt-6 grid gap-3 sm:grid-cols-2">
          {espacios.map((hoja) => {
            const label =
              dict.community.spaces[hoja.key as keyof typeof dict.community.spaces];
            const desc = H.spaceDesc[hoja.key as keyof typeof H.spaceDesc];
            const n = counts[hoja.key];
            // Un espacio de miembros lleva a registro, no a una puerta cerrada:
            // el clic ya dijo que le interesa.
            const bloqueado = Boolean(hoja.gated) && !dentro;
            return (
              <StaggerItem key={hoja.key}>
                <Link
                  href={bloqueado ? "/signup" : hoja.href}
                  className="group flex h-full flex-col rounded-2xl border border-surface-line bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/30 hover:shadow-[0_10px_28px_rgba(8,145,178,0.09)]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-navy/[0.06] text-navy transition-colors group-hover:bg-cyan group-hover:text-white">
                      <Icon name={hoja.icon as IconName} size={15} />
                    </span>
                    <p className="font-display text-[0.95rem] font-bold text-navy">
                      {label}
                    </p>
                    {bloqueado ? (
                      <Icon name="lock" size={12} className="ml-auto text-muted/60" />
                    ) : (
                      n !== undefined &&
                      n > 0 && (
                        <span className="ml-auto rounded-full bg-navy/[0.06] px-1.5 py-0.5 text-[0.65rem] font-bold tabular-nums text-muted">
                          {n}
                        </span>
                      )
                    )}
                  </div>
                  <p className="mt-2.5 flex-1 text-sm leading-snug text-muted">{desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-cyan-700">
                    {H.spaceGo}
                    <Icon
                      name="arrowRight"
                      size={12}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* ═══════════ CÓMO EMPEZAR ═══════════ */}
      <section className="rounded-3xl border border-surface-line bg-paper p-6 sm:p-8">
        <Reveal>
          <p className="kicker">{H.startKicker}</p>
          <h2 className="mt-2 font-display text-xl font-extrabold leading-tight text-navy sm:text-2xl">
            {H.startTitle}
          </h2>
        </Reveal>

        <ol className="relative mt-6 flex flex-col gap-5">
          <span
            className="absolute bottom-5 left-[15px] top-5 w-px bg-gradient-to-b from-cyan via-cyan/30 to-gold/60"
            aria-hidden
          />
          {H.steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-3.5">
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy font-display text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 pt-1">
                <p className="font-display text-[0.95rem] font-bold text-navy">{s.title}</p>
                <p className="mt-0.5 text-sm leading-snug text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ═══════════ CIERRE ═══════════
          Sólo para quien aún no entró. A un miembro, un cartel de "únete" le
          está diciendo que no sabemos quién es. */}
      {!dentro && (
        <Reveal className="relative overflow-hidden rounded-3xl bg-navy px-6 py-8 text-center text-white sm:px-8">
          <span
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(34,211,238,0.18),transparent_70%)]"
            aria-hidden
          />
          <div className="relative">
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              {H.finalTitle}
            </h2>
            <p className="mx-auto mt-2.5 max-w-[46ch] text-sm leading-relaxed text-white/70">
              {H.finalBody}
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 font-semibold text-navy shadow-[0_10px_30px_rgba(251,191,36,0.35)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-300"
            >
              {H.ctaJoin}
              <Icon name="arrowRight" size={16} />
            </Link>
            <p className="mt-2.5 text-xs text-white/40">{H.ctaJoinNote}</p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
