import Image from "next/image";
import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { BOOTCAMP, BOOTCAMP_DAYS, BOOTCAMP_MEDIA } from "@/lib/bootcamp";
import { CountdownInline } from "./Countdown";
import { Icon } from "@/components/icons";

/**
 * El bootcamp dentro de Inicio, con fotos.
 *
 * Antes era una caja navy con texto, igual de grande y del mismo color que los
 * otros seis bloques de la página. Un viaje a Utah no se vende contándolo: se
 * vende enseñándolo. Las fotos ya existían en `public/bootcamp/` y sólo vivían
 * en la página del programa, donde llega quien YA está interesado.
 *
 * Dos piezas:
 *
 * · UNA FOTO GRANDE que rompe el ritmo de tarjetas. Es lo único a sangre y a
 *   pantalla alta en toda la página; sin ese salto de escala nada destaca.
 * · UNA TIRA DE LOS CUATRO DÍAS. En móvil se arrastra con el dedo y cada
 *   tarjeta se ancla al soltar (`snap`), que es como se navegan fotos en el
 *   móvil. En escritorio se abre en cuatro columnas, porque ahí hay sitio y
 *   arrastrar con el ratón es peor que ver el conjunto.
 *
 * El movimiento al pasar por encima es sólo `transform` sobre la imagen: la
 * capa ya está rasterizada, así que no cuesta un repintado.
 */
export async function BootcampShowcase() {
  const { dict, locale } = await getDict();
  const H = dict.community.home;
  const B = dict.bootcamp;

  return (
    <section className="flex flex-col gap-3">
      {/* ── LA FOTO ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-navy shadow-[0_18px_50px_rgba(26,39,68,0.3)]">
        {BOOTCAMP_MEDIA.hero && (
          <>
            {/* Dos archivos, no uno recortado: en móvil el bloque es casi
                cuadrado y en escritorio muy apaisado. Recortar el apaisado al
                centro se comería las montañas, que son medio argumento. */}
            <Image
              src={BOOTCAMP_MEDIA.hero.srcMobile}
              alt={BOOTCAMP_MEDIA.hero.alt}
              fill
              sizes="(max-width: 640px) 100vw, 700px"
              className="object-cover object-bottom sm:hidden"
            />
            <Image
              src={BOOTCAMP_MEDIA.hero.src}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 1280px) 100vw, 700px"
              className="hidden object-cover sm:block"
            />
          </>
        )}
        {/* Velo direccional: denso donde vive el texto, transparente donde está
            el paisaje. No uniforme — si no, se apaga la foto entera. */}
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,24,0.92)_0%,rgba(6,10,24,0.72)_42%,rgba(6,10,24,0.2)_75%,transparent_100%)] sm:bg-[linear-gradient(100deg,rgba(6,10,24,0.94)_0%,rgba(6,10,24,0.76)_44%,rgba(6,10,24,0.15)_78%,transparent_100%)]"
          aria-hidden
        />

        <div className="relative flex min-h-[380px] flex-col justify-end p-6 text-white sm:min-h-[340px] sm:justify-center sm:p-9">
          <div className="max-w-md">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="kicker text-gold">{H.bootcampKicker}</p>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/45">
                <CountdownInline />
              </span>
            </div>

            <h2 className="mt-2.5 font-display text-[1.6rem] font-extrabold leading-[1.1] text-white [text-wrap:balance] sm:text-[2.1rem]">
              {H.bootcampTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{H.bootcampBody}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-navy">
                <Icon name="star" size={11} />
                {BOOTCAMP.seats} cupos · ${BOOTCAMP.priceUSD}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-navy/30 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-gold backdrop-blur-sm">
                <Icon name="clock" size={11} />
                {locale === "es" ? BOOTCAMP.deadlineEs : BOOTCAMP.deadlineEn}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/bootcamp/reservar"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 font-semibold text-navy shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-300"
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
        </div>
        <span
          className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-cyan-bright via-cyan to-gold"
          aria-hidden
        />
      </div>

      {/* ── LOS CUATRO DÍAS ────────────────────────────────────────── */}
      <div
        className="
          -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0
        "
      >
        {BOOTCAMP_DAYS.map((dia) => {
          const foto = dia.photo ?? dia.art;
          const copy = locale === "es" ? dia.es : dia.en;
          return (
            <Link
              key={dia.n}
              href="/bootcamp"
              className="group relative aspect-[3/4] w-[63%] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-navy sm:aspect-[3/4] sm:w-auto"
            >
              {foto && (
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  sizes="(max-width: 640px) 63vw, 170px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
              )}
              <span
                className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,10,24,0.92)_0%,rgba(6,10,24,0.45)_38%,transparent_72%)]"
                aria-hidden
              />
              {/* El día 3 es el corazón del programa: se marca, no se explica. */}
              {dia.hero && (
                <span className="absolute right-2.5 top-2.5 rounded-full bg-gold px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-navy">
                  {B.heartLabel}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-gold">
                  {B.dayLabel} {dia.n}
                </p>
                <p className="mt-1 font-display text-[0.82rem] font-bold leading-tight text-white [text-wrap:balance]">
                  {copy.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
