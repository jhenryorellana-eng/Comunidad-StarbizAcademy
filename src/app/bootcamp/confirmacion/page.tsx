import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Icon } from "@/components/icons";
import { LetterForm } from "@/components/bootcamp/LetterForm";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { BOOTCAMP } from "@/lib/bootcamp";

export const metadata: Metadata = {
  title: "Inscripción confirmada — Bootcamp Utah 2027",
  robots: { index: false, follow: false },
};

/**
 * Vuelta desde el checkout.
 *
 * Se comprueba la sesión contra Stripe antes de dar nada por bueno: el
 * `session_id` viaja en la URL y podría manipularse. Además se crea aquí la
 * inscripción si el webhook aún no ha llegado — los dos caminos usan `upsert`
 * sobre la misma clave única, así que no se duplica.
 */
export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId || !stripeEnabled || !stripe) notFound();

  const sesion = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
  if (!sesion || sesion.payment_status !== "paid") notFound();

  // Red de seguridad: si el webhook aún no ha llegado, la inscripción se crea
  // aquí igualmente. El webhook sigue siendo la fuente de verdad.
  const registro = await prisma.bootcampRegistration.upsert({
    where: { stripeSessionId: sesion.id },
    create: {
      stripeSessionId: sesion.id,
      paymentIntentId:
        typeof sesion.payment_intent === "string" ? sesion.payment_intent : null,
      email: sesion.customer_details?.email ?? sesion.customer_email ?? "",
      payerName: sesion.customer_details?.name ?? null,
      amountTotal: sesion.amount_total ?? 0,
      currency: sesion.currency ?? "usd",
      status: "PAID",
      livemode: sesion.livemode,
    },
    update: {},
  });

  const pasos = [
    {
      icon: "check" as const,
      titulo: "Tu cupo está reservado",
      texto: `Pago confirmado. Recibirás el recibo en ${registro.email}.`,
      hecho: true,
    },
    {
      icon: "fileText" as const,
      titulo: "Emitimos tus dos cartas de invitación",
      texto:
        "Una para el participante y otra para su acompañante. Te llegan por correo en un plazo de 7 días.",
    },
    {
      icon: "clock" as const,
      titulo: "Agenda la cita del consulado — cuanto antes",
      texto:
        "Este es el paso que más tarda: en varios países la cita se da con meses de espera. En cuanto tengas las cartas, agéndala.",
      urgente: true,
    },
    {
      icon: "events" as const,
      titulo: `Nos vemos en Utah`,
      texto: "Del 26 al 31 de enero de 2027.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader mobileMenu nav={false} />

      <section className="relative overflow-hidden bg-gradient-to-b from-navy to-navy-800 py-14 text-white sm:py-20">
        <div className="container-ac relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">
            <Icon name="check" size={13} />
            Inscripción confirmada
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            Tu hijo tiene cupo en {BOOTCAMP.name}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Esto es lo que pasa a partir de ahora. El tercer paso es el que de verdad
            corre — no lo dejes para después.
          </p>
        </div>
        <span
          className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-cyan-bright via-cyan to-gold"
          aria-hidden
        />
      </section>

      <section className="container-ac py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          {/* Los siguientes pasos */}
          <ol className="relative flex flex-col gap-6">
            <span
              className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-emerald-400/60 via-cyan/30 to-gold/50"
              aria-hidden
            />
            {pasos.map((p) => (
              <li key={p.titulo} className="relative flex gap-4">
                <span
                  className={
                    p.hecho
                      ? "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                      : p.urgente
                        ? "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-navy shadow-[0_0_16px_3px_rgba(251,191,36,0.4)]"
                        : "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan/40 bg-paper text-cyan"
                  }
                >
                  <Icon name={p.icon} size={17} />
                </span>
                <div className="min-w-0 pt-1">
                  <p className="font-display font-bold text-navy">{p.titulo}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* El formulario de las cartas */}
          <div>
            {registro.profileComplete ? (
              <div className="rounded-2xl border border-surface-line bg-paper p-6">
                <p className="font-display text-lg font-bold text-navy">
                  Ya tenemos tus datos
                </p>
                <p className="mt-1.5 text-sm text-muted">
                  Estamos preparando las dos cartas de invitación.
                </p>
              </div>
            ) : (
              <LetterForm sessionId={sesion.id} />
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-surface-line pt-8">
          <Link
            href="/bootcamp"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:underline"
          >
            <Icon name="arrowRight" size={14} className="rotate-180" />
            Volver al programa
          </Link>
          <a
            href={`https://wa.me/13854564470?text=${encodeURIComponent(
              "Hola, acabo de inscribirme al Bootcamp Utah 2027 y tengo una duda",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-navy"
          >
            ¿Alguna duda? Escríbenos
            <Icon name="external" size={13} />
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
