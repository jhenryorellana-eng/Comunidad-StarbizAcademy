"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { BOOTCAMP } from "@/lib/bootcamp";
import { CieloUtah } from "./CieloUtah";
import { FormularioReserva } from "./FormularioReserva";
import { EstrellaMarca } from "./SelectorPais";

/**
 * Sostiene el paso del formulario, porque hay dos cosas que lo necesitan: el
 * acordeón y el cielo. El sol se pone a medida que se avanza, así que el
 * encabezado no puede ser un componente de servidor ajeno al estado.
 *
 * Todo lo que viene de la base —cuántos cupos quedan, qué incluye— llega por
 * props desde la página, que sí es de servidor. Aquí no se consulta nada.
 */
export function ReservaConCielo({
  restantes,
  incluye,
}: {
  restantes: number | null;
  incluye: readonly string[];
}) {
  const [paso, setPaso] = useState(1);
  const inicio = paso === 1;

  return (
    <>
      <CieloUtah paso={paso}>
        <div className="pt-4 sm:pt-6">
          {/* El enlace de vuelta sólo tiene sentido antes de empezar: una vez
              dentro, quien lo pulse pierde lo escrito. */}
          {inicio && (
            /* Tinta oscura, no blanca: a la hora dorada el cielo está claro y
               el blanco al 75% se leía a duras penas. */
            <Link
              href="/bootcamp"
              className="-ml-1.5 inline-flex min-h-[44px] items-center gap-1.5 px-1.5 text-[0.82rem] font-semibold text-ocaso-hondo/80 transition-colors hover:text-ocaso-hondo"
            >
              <Icon name="arrowRight" size={12} className="rotate-180" />
              Volver al programa
            </Link>
          )}

          <div className="flex items-center gap-2">
            <EstrellaMarca
              className={inicio ? "h-3 w-3 text-ocaso-hondo" : "h-3 w-3 text-gold-300"}
            />
            <p
              className={
                inicio
                  ? "font-display text-[0.63rem] font-semibold uppercase tracking-[0.22em] text-ocaso-hondo"
                  : "font-display text-[0.63rem] font-semibold uppercase tracking-[0.22em] text-gold-300"
              }
            >
              {paso > 3 ? "Último paso" : "Reservar cupo"}
            </p>
          </div>

          {inicio ? (
            <h1 className="mt-2 max-w-[13ch] font-display text-[1.8rem] font-extrabold leading-[1.08] tracking-tight text-white [text-shadow:0_2px_18px_rgba(60,26,40,0.45)] sm:max-w-[15ch] sm:text-[2.4rem] lg:text-[2.7rem]">
              {restantes !== null && restantes > 0 ? (
                <>
                  Quedan <span className="text-[#fff0c4]">{restantes} cupos</span> para Utah
                </>
              ) : (
                <>
                  Tu cupo bajo el <span className="text-[#fff0c4]">cielo de Utah</span>
                </>
              )}
            </h1>
          ) : (
            <h1 className="mt-2 font-display text-[1.35rem] font-extrabold leading-tight tracking-tight text-white [text-shadow:0_2px_18px_rgba(30,14,32,0.55)] sm:text-[1.7rem]">
              {BOOTCAMP.name}
            </h1>
          )}
        </div>
      </CieloUtah>

      <div className="container-ac py-7 sm:py-9">
        {inicio && (
          <p className="mb-6 max-w-[46ch] text-sm leading-relaxed text-arena-texto sm:text-[0.95rem]">
            Del 26 al 31 de enero de 2027. Tres pasos cortos y nosotros redactamos las dos cartas de
            invitación.
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px] lg:gap-9">
          <div>
            <FormularioReserva paso={paso} setPaso={setPaso} />
          </div>

          {/* Qué se lleva por sus $250, a la vista mientras decide. En móvil se
              oculta: el propio repaso ya lo enseña justo antes de pagar, y
              repetirlo alargaba la página sin añadir nada. */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-arena-linea bg-paper">
              <span
                className="block h-0.5 bg-gradient-to-r from-ocaso via-ocaso-vivo to-gold"
                aria-hidden
              />
              <div className="p-5">
                <div className="flex items-baseline gap-2">
                  <p className="font-display text-[2.1rem] font-extrabold tracking-tight text-navy">
                    ${BOOTCAMP.priceUSD}
                  </p>
                  <span className="text-sm font-semibold text-arena-tinta">USD</span>
                </div>
                <p className="mt-0.5 text-xs text-arena-tinta">por participante · pago único</p>

                <div className="mt-5 space-y-2.5 border-t border-arena-linea pt-4">
                  {incluye.map((i) => (
                    <p key={i} className="flex gap-2.5 text-[0.8rem] leading-snug text-ink">
                      <EstrellaMarca className="mt-0.5 h-3 w-3 shrink-0 text-ocaso-vivo" />
                      {i}
                    </p>
                  ))}
                </div>

                <p className="mt-5 flex items-start gap-2 rounded-xl border border-ocaso-borde bg-ocaso-suave p-3 text-xs leading-snug text-ocaso-hondo">
                  <Icon name="clock" size={12} className="mt-0.5 shrink-0" />
                  Cierre el {BOOTCAMP.deadlineEs}. La cita del consulado tarda meses en varios
                  países — cuanto antes, mejor.
                </p>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.68rem] text-arena-tinta">
                  <Icon name="lock" size={11} />
                  Pago seguro con Stripe
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
