import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NightSky } from "@/components/Constellation";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/prisma";
import { BOOTCAMP, BOOTCAMP_INCLUDES } from "@/lib/bootcamp";
import { FormularioReserva } from "@/components/bootcamp/FormularioReserva";
import { EstrellaMarca } from "@/components/bootcamp/SelectorPais";

export const metadata: Metadata = {
  title: "Reservar cupo — Bootcamp Utah 2027",
  robots: { index: false, follow: false },
};

/**
 * RELLENAR → PAGAR. Sin cuenta de por medio.
 *
 * El bootcamp es un producto que se vende solo, no una función de la comunidad:
 * alguien llega desde un anuncio a /bootcamp, pulsa reservar y compra. Exigir
 * registro antes ponía un muro justo donde peor sienta, entre el anuncio y la
 * venta.
 *
 * LA PÁGINA ES DE NOCHE, como la portada del programa. No es decoración: quien
 * llega aquí viene de ver el cielo de Utah, y cambiar a un formulario blanco
 * rompía la continuidad justo en el momento de pagar.
 */
export default async function ReservarPage() {
  const incluye = BOOTCAMP_INCLUDES.es.included;

  // Cupos reales, no un número de marketing. Si alguna vez el contador falla,
  // se prefiere no decir nada a decir algo falso.
  const pagados = await prisma.bootcampRegistration
    .count({ where: { status: "PAID" } })
    .catch(() => null);
  const restantes = pagados === null ? null : Math.max(0, BOOTCAMP.seats - pagados);

  return (
    /* El envoltorio va oscuro, no `bg-surface`: el pie lleva 96px de margen
       superior y sobre fondo claro dejaba una franja blanca entre el cielo y el
       pie navy. Así la noche llega entera hasta abajo. */
    <div className="flex min-h-screen flex-col bg-[#050a16]">
      <SiteHeader mobileMenu />

      <main className="relative flex-1 overflow-hidden bg-[#070d1c]">
        {/* Cielo: el mismo de la portada, y ya afinado para móvil (las capas
            animadas se reducen por debajo de sm). */}
        <div
          className="absolute inset-0 bg-[radial-gradient(130%_38%_at_22%_0%,#17284f_0%,transparent_62%),radial-gradient(100%_28%_at_90%_4%,rgba(82,63,255,0.26)_0%,transparent_64%),radial-gradient(90%_26%_at_50%_100%,rgba(8,145,178,0.18)_0%,transparent_72%),linear-gradient(180deg,#0c1630_0%,#070d1c_46%,#050a16_100%)]"
          aria-hidden
        />
        <NightSky />

        {/* UTAH grabado en el cielo, no pegado encima. Muy tenue: aquí compite
            con el titular, y el titular manda. */}
        <span
          className="pointer-events-none absolute right-[-3%] top-6 select-none font-display font-extrabold uppercase leading-none text-transparent"
          style={{
            fontSize: "clamp(4rem, 13vw, 9.5rem)",
            letterSpacing: "0.16em",
            backgroundImage:
              "linear-gradient(178deg, rgba(255,255,255,0.13) 0%, rgba(190,235,250,0.07) 60%, rgba(34,211,238,0.02) 92%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextStroke: "0.5px rgba(255,255,255,0.09)",
          }}
          aria-hidden
        >
          Utah
        </span>

        <div className="container-ac relative py-8 sm:py-12">
          <Link
            href="/bootcamp"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-[0.82rem] font-semibold text-white/50 transition-colors hover:text-white"
          >
            <Icon name="arrowRight" size={12} className="rotate-180" />
            Volver al programa
          </Link>

          <div className="mt-2 flex items-center gap-2">
            <EstrellaMarca className="h-3 w-3 text-gold" />
            <p className="font-display text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-gold">
              Reservar cupo
            </p>
          </div>

          <h1 className="mt-2.5 max-w-[16ch] font-display text-[1.95rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.9rem]">
            {restantes !== null && restantes > 0 ? (
              <>
                Quedan{" "}
                <span className="bg-[linear-gradient(135deg,#22d3ee_0%,#0891b2_55%,#523fff_100%)] bg-clip-text text-transparent">
                  {restantes} cupos
                </span>{" "}
                bajo el cielo de Utah
              </>
            ) : (
              <>
                Tu cupo bajo el{" "}
                <span className="bg-[linear-gradient(135deg,#22d3ee_0%,#0891b2_55%,#523fff_100%)] bg-clip-text text-transparent">
                  cielo de Utah
                </span>
              </>
            )}
          </h1>

          <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-white/55 sm:text-[0.95rem]">
            Del 26 al 31 de enero de 2027. Tres pasos cortos y nosotros redactamos las dos cartas de
            invitación.
          </p>

          <div className="mt-7 grid gap-6 lg:mt-9 lg:grid-cols-[minmax(0,1fr)_310px] lg:gap-9">
            <div>
              <FormularioReserva />
            </div>

            {/* Qué se lleva por sus $250, a la vista mientras decide. En móvil
                se oculta: el propio repaso ya lo enseña justo antes de pagar, y
                repetirlo alargaba la página sin añadir nada. */}
            <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-cyan-bright/22 bg-[rgba(11,20,42,0.75)]">
                <span
                  className="block h-0.5 bg-gradient-to-r from-cyan-bright via-cyan to-gold"
                  aria-hidden
                />
                <div className="p-5">
                  <div className="flex items-baseline gap-2">
                    <p className="font-display text-[2.1rem] font-extrabold tracking-tight text-white">
                      ${BOOTCAMP.priceUSD}
                    </p>
                    <span className="text-sm font-semibold text-white/45">USD</span>
                  </div>
                  <p className="mt-0.5 text-xs text-white/45">por participante · pago único</p>

                  <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4">
                    {incluye.map((i) => (
                      <p key={i} className="flex gap-2.5 text-[0.8rem] leading-snug text-white/82">
                        <EstrellaMarca className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                        {i}
                      </p>
                    ))}
                  </div>

                  <p className="mt-5 flex items-start gap-2 rounded-xl border border-gold/20 bg-gold/[0.09] p-3 text-xs leading-snug text-gold-300">
                    <Icon name="clock" size={12} className="mt-0.5 shrink-0" />
                    Cierre el {BOOTCAMP.deadlineEs}. La cita del consulado tarda meses en varios
                    países — cuanto antes, mejor.
                  </p>

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.68rem] text-white/38">
                    <Icon name="lock" size={11} />
                    Pago seguro con Stripe
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
