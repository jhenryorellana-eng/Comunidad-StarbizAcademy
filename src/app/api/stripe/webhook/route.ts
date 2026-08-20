import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Webhook de Stripe. **Es la fuente de verdad del pago.**
 *
 * La página de confirmación no basta: el comprador puede cerrar el navegador
 * justo después de pagar y no volver nunca. El webhook llega igual, así que la
 * inscripción se guarda pase lo que pase.
 *
 * Dos cosas que no son opcionales:
 *
 * 1. VERIFICAR LA FIRMA. Sin ella, cualquiera que conozca la URL podría enviar
 *    un "pago completado" falso y colarse una inscripción gratis. Para eso hace
 *    falta el cuerpo CRUDO —`req.text()`—: si se parsea a JSON antes, la firma
 *    deja de cuadrar.
 * 2. SER IDEMPOTENTE. Stripe reintenta ante cualquier error o timeout, así que
 *    el mismo evento puede llegar varias veces. Se resuelve con `upsert` sobre
 *    `stripeSessionId`, que es único.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeEnabled || !stripe || !secret) {
    return NextResponse.json({ error: "Stripe no configurado." }, { status: 503 });
  }

  const firma = req.headers.get("stripe-signature");
  if (!firma) {
    return NextResponse.json({ error: "Falta la firma." }, { status: 400 });
  }

  let evento: Stripe.Event;
  try {
    const crudo = await req.text();
    evento = stripe.webhooks.constructEvent(crudo, firma, secret);
  } catch (e) {
    // Firma inválida: se rechaza sin tocar la base.
    console.error("[stripe/webhook] firma inválida:", (e as Error).message);
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  try {
    switch (evento.type) {
      case "checkout.session.completed": {
        const s = evento.data.object;
        // `payment_status` puede quedar pendiente con métodos asíncronos
        // (transferencias, OXXO…): sólo se da por pagada si está confirmado.
        if (s.payment_status !== "paid") break;

        // La reserva ya existe: la creó el formulario ANTES de mandar a
        // pagar. Aquí sólo se marca como pagada. Ese orden es lo que permite
        // conservar a quien rellenó y abandonó, que es un contacto y no un
        // pago perdido.
        const registrationId = s.metadata?.registrationId;

        if (registrationId) {
          await prisma.bootcampRegistration.updateMany({
            where: { id: registrationId },
            data: {
              status: "PAID",
              paidAt: new Date(),
              stripeSessionId: s.id,
              paymentIntentId:
                typeof s.payment_intent === "string" ? s.payment_intent : null,
              amountTotal: s.amount_total ?? 0,
              currency: s.currency ?? "usd",
              livemode: evento.livemode,
            },
          });
        } else {
          // Sin metadata: un pago llegado por otra vía (un enlace de cobro
          // creado a mano en Stripe, por ejemplo). Se guarda igual — nunca se
          // pierde un cobro — y el panel lo marcará como incompleto.
          await prisma.bootcampRegistration.upsert({
            where: { stripeSessionId: s.id },
            create: {
              stripeSessionId: s.id,
              paymentIntentId:
                typeof s.payment_intent === "string" ? s.payment_intent : null,
              email: s.customer_details?.email ?? s.customer_email ?? "",
              payerName: s.customer_details?.name ?? null,
              participantName: s.customer_details?.name ?? "(sin nombre)",
              amountTotal: s.amount_total ?? 0,
              currency: s.currency ?? "usd",
              status: "PAID",
              paidAt: new Date(),
              livemode: evento.livemode,
            },
            update: { status: "PAID", paidAt: new Date() },
          });
        }
        break;
      }

      case "charge.refunded": {
        const c = evento.data.object;
        const pi = typeof c.payment_intent === "string" ? c.payment_intent : null;
        if (pi) {
          await prisma.bootcampRegistration.updateMany({
            where: { paymentIntentId: pi },
            data: { status: "REFUNDED" },
          });
        }
        break;
      }
    }
  } catch (e) {
    // Se devuelve 500 a propósito: Stripe reintentará, y el upsert hace que
    // reintentar sea inofensivo.
    console.error("[stripe/webhook]", evento.type, e);
    return NextResponse.json({ error: "Error al procesar." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
