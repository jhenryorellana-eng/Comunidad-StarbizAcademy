import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Icon } from "@/components/icons";
import { BOOTCAMP, BOOTCAMP_MEDIA, BOOTCAMP_INCLUDES } from "@/lib/bootcamp";
import { FormularioReserva } from "@/components/bootcamp/FormularioReserva";

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
 * Los datos se guardan ANTES de mandar a Stripe. Quien rellena y abandona en la
 * pasarela queda igualmente en el panel como pendiente — con el nombre del
 * chico, el correo del padre y dónde vive. Ése es el contacto más caliente que
 * existe, y con el orden inverso se perdería entero.
 */
export default async function ReservarPage() {
  const incluye = BOOTCAMP_INCLUDES.es.included;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader mobileMenu />

      {/* Cabecera: la foto real, en banda baja. Recuerda qué se está comprando
          sin robarle la pantalla a la decisión. */}
      <section className="relative overflow-hidden bg-navy">
        {BOOTCAMP_MEDIA.invite && (
          <Image
            src={BOOTCAMP_MEDIA.invite.src}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover object-center opacity-45"
            priority
          />
        )}
        <span
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,24,0.86)_0%,rgba(6,10,24,0.7)_55%,rgba(6,10,24,0.92)_100%)]"
          aria-hidden
        />
        <div className="container-ac relative py-10 text-white sm:py-14">
          <Link
            href="/bootcamp"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 transition-colors hover:text-white"
          >
            <Icon name="arrowRight" size={12} className="rotate-180" />
            Volver al programa
          </Link>
          <p className="kicker mt-4 text-gold">Reservar cupo</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            {BOOTCAMP.name}
          </h1>
          <p className="mt-2 text-sm text-white/65">
            Del 26 al 31 de enero de 2027 · Utah, Estados Unidos
          </p>
        </div>
        <span
          className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-cyan-bright via-cyan to-gold"
          aria-hidden
        />
      </section>

      <main className="container-ac flex-1 py-8 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-10">
          {/* La decisión */}
          <div>
            <FormularioReserva />
          </div>

          {/* Qué se lleva por sus $250. A la vista mientras decide, no en otra
              página: nadie debería tener que recordar qué incluye. */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-surface-line bg-paper p-5">
              <div className="flex items-baseline gap-2">
                <p className="font-display text-3xl font-extrabold text-navy">
                  ${BOOTCAMP.priceUSD}
                </p>
                <span className="text-sm font-semibold text-muted">USD</span>
              </div>
              <p className="mt-1 text-xs text-muted">por participante · pago único</p>

              <div className="mt-5 space-y-2.5 border-t border-surface-line pt-4">
                {incluye.map((i) => (
                  <p key={i} className="flex gap-2.5 text-sm leading-snug text-ink">
                    <Icon
                      name="check"
                      size={15}
                      className="mt-0.5 shrink-0 text-cyan"
                    />
                    {i}
                  </p>
                ))}
              </div>

              <p className="mt-5 flex items-start gap-2 rounded-xl bg-gold/[0.08] p-3 text-xs leading-snug text-gold-700">
                <Icon name="clock" size={13} className="mt-0.5 shrink-0" />
                Quedan {BOOTCAMP.seats} cupos y el cierre es el {BOOTCAMP.deadlineEs}. La
                cita del consulado tarda meses en varios países — cuanto antes, mejor.
              </p>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.7rem] text-muted">
                <Icon name="lock" size={11} />
                Pago seguro con Stripe
              </p>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
