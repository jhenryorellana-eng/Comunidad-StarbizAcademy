import { NextResponse } from "next/server";
import { z } from "zod";
import {
  stripe,
  stripeEnabled,
  siteUrl,
  BOOTCAMP_PRICE_CENTS,
  BOOTCAMP_CURRENCY,
} from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { BOOTCAMP } from "@/lib/bootcamp";

/**
 * Abre el pago de una reserva que YA está guardada.
 *
 * NO PIDE CUENTA. El bootcamp es un producto que se vende solo: alguien llega
 * desde un anuncio, rellena el formulario y compra. Exigir registro en la
 * comunidad sólo ponía un muro entre el anuncio y la venta.
 *
 * Lo único que llega del navegador es el ID de la reserva. Todo lo demás
 * —nombre, correo y sobre todo el PRECIO— sale de la base o de las constantes
 * del servidor. Si el importe viniera del cliente, cualquiera pagaría un
 * céntimo cambiando un número antes de enviar la petición.
 *
 * Checkout ALOJADO: los datos de la tarjeta nunca tocan este servidor, así que
 * no hay carga de cumplimiento PCI, y Stripe resuelve 3D Secure y los métodos
 * de pago locales de cada país.
 */
const Cuerpo = z.object({ registrationId: z.string().min(1) });

export async function POST(req: Request) {
  if (!stripeEnabled || !stripe) {
    return NextResponse.json(
      { error: "Stripe no está configurado (falta STRIPE_SECRET_KEY)." },
      { status: 503 },
    );
  }

  const parsed = Cuerpo.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Falta la reserva." }, { status: 400 });
  }

  const reserva = await prisma.bootcampRegistration.findUnique({
    where: { id: parsed.data.registrationId },
    select: { id: true, status: true, participantName: true, email: true },
  });
  if (!reserva) {
    return NextResponse.json({ error: "Esa reserva no existe." }, { status: 404 });
  }
  // Cobrar dos veces por el mismo cupo es el error que peor se explica después.
  if (reserva.status === "PAID") {
    return NextResponse.json(
      { error: `El cupo de ${reserva.participantName} ya está pagado.` },
      { status: 409 },
    );
  }

  try {
    const base = siteUrl();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      automatic_tax: { enabled: false },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: BOOTCAMP_CURRENCY,
            unit_amount: BOOTCAMP_PRICE_CENTS,
            product_data: {
              name: `${BOOTCAMP.name} — ${reserva.participantName}`,
              description:
                "Inscripción: cupo en el bootcamp + carta de invitación oficial para el participante y un acompañante.",
            },
          },
        },
      ],
      // El correo ya se pidió en el formulario: un campo menos antes de pagar.
      customer_email: reserva.email,
      billing_address_collection: "auto",
      // El webhook sólo recibe la sesión de Stripe. Este id es el hilo que le
      // dice qué reserva marcar como pagada.
      metadata: { producto: "bootcamp-utah-2027", registrationId: reserva.id },
      success_url: `${base}/bootcamp/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/bootcamp?pago=cancelado`,
    });

    if (!checkout.url) {
      return NextResponse.json({ error: "Stripe no devolvió URL." }, { status: 502 });
    }

    // Se guarda AHORA, no al volver: si el navegador se cierra entre este punto
    // y el pago, el webhook sigue sabiendo a qué reserva pertenece la sesión.
    await prisma.bootcampRegistration.update({
      where: { id: reserva.id },
      data: { stripeSessionId: checkout.id },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    console.error("[bootcamp/checkout]", e);
    return NextResponse.json(
      { error: "No se pudo abrir el pago. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
