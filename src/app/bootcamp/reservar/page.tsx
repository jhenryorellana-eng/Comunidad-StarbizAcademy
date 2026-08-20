import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { BOOTCAMP, BOOTCAMP_INCLUDES } from "@/lib/bootcamp";
import { ReservaConCielo } from "@/components/bootcamp/ReservaConCielo";

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
 * EL CIELO ACOMPAÑA. El encabezado es el atardecer de Utah y el sol se pone a
 * medida que se avanza por el formulario: hora dorada al llegar, cielo lleno de
 * estrellas al pagar. Va atado al PASO y no a un reloj — con temporizador,
 * quien se levante a buscar el pasaporte de su hijo volvería a una noche
 * cerrada sin haber rellenado nada.
 *
 * Esta página no consulta más que el contador de cupos; todo lo interactivo
 * vive en `ReservaConCielo`.
 */
export default async function ReservarPage() {
  // Cupos reales, no un número de marketing. Si el contador falla, se prefiere
  // no decir nada a decir algo falso.
  const pagados = await prisma.bootcampRegistration
    .count({ where: { status: "PAID" } })
    .catch(() => null);
  const restantes = pagados === null ? null : Math.max(0, BOOTCAMP.seats - pagados);

  return (
    <div className="flex min-h-screen flex-col bg-arena">
      <SiteHeader mobileMenu />

      <main className="flex-1">
        <ReservaConCielo restantes={restantes} incluye={BOOTCAMP_INCLUDES.es.included} />
      </main>

      <SiteFooter />
    </div>
  );
}
