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
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { BOOTCAMP } from "@/lib/bootcamp";

/**
 * Abre la sesión de pago del bootcamp.
 *
 * PAGA EL PADRE, Y PAGA POR UN HIJO CONCRETO. Antes cualquiera podía pagar sin
 * cuenta y los nombres para las cartas se pedían DESPUÉS, en un formulario que
 * mucha gente no vuelve a abrir — de ahí el estado "faltan datos de la carta"
 * del panel. Ahora el nombre y la fecha de nacimiento del participante ya están
 * en el sistema cuando se cobra: salen de su cuenta de CEO Junior, sin erratas
 * y sin depender de que alguien rellene nada.
 *
 * Checkout ALOJADO a propósito: los datos de la tarjeta nunca tocan este
 * servidor, así que no hay carga de cumplimiento PCI, y Stripe resuelve 3D
 * Secure y los métodos de pago locales de cada país.
 */
const Cuerpo = z.object({ childId: z.string().min(1) });

export async function POST(req: Request) {
  if (!stripeEnabled || !stripe) {
    return NextResponse.json(
      { error: "Stripe no está configurado (falta STRIPE_SECRET_KEY)." },
      { status: 503 },
    );
  }

  // 1 · Sólo un padre/tutor (o admin) puede pagar. Un menor no compra su
  //     propio viaje: ese acto es también el consentimiento del adulto.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Necesitas una cuenta." }, { status: 401 });
  }
  if (session.role !== ROLES.PARENT && session.role !== ROLES.ADMIN) {
    return NextResponse.json(
      { error: "El cupo lo reserva la cuenta de mamá, papá o tutor." },
      { status: 403 },
    );
  }

  const parsed = Cuerpo.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Falta indicar a quién le reservas." }, { status: 400 });
  }

  // 2 · Ese hijo tiene que ser SUYO. Sin esta comprobación, cualquiera con una
  //     cuenta podría reservar a nombre del hijo de otro cambiando un id.
  const hijo = await prisma.user.findFirst({
    where: {
      id: parsed.data.childId,
      ...(session.role === ROLES.ADMIN ? {} : { parentId: session.sub }),
    },
    select: { id: true, name: true, birthdate: true },
  });
  if (!hijo) {
    return NextResponse.json({ error: "Ese participante no es tuyo." }, { status: 403 });
  }

  // 3 · Y no puede tener ya un cupo pagado. Cobrar dos veces por el mismo
  //     chico es el error que peor se explica después.
  const yaTiene = await prisma.bootcampRegistration.findFirst({
    where: { childId: hijo.id, status: "PAID" },
    select: { id: true },
  });
  if (yaTiene) {
    return NextResponse.json(
      { error: `${hijo.name} ya tiene su cupo reservado.` },
      { status: 409 },
    );
  }

  try {
    const base = siteUrl();
    const pagador = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { email: true, name: true },
    });

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
              name: `${BOOTCAMP.name} — ${hijo.name}`,
              description:
                "Inscripción: cupo en el bootcamp + carta de invitación oficial para el participante y un acompañante.",
            },
          },
        },
      ],
      // El correo ya lo conocemos: un campo menos entre el clic y el pago.
      customer_email: pagador?.email,
      billing_address_collection: "auto",
      // El webhook es quien escribe la inscripción, y sólo recibe la sesión de
      // Stripe. Estos dos ids son el único hilo que le dice de quién es el pago.
      metadata: {
        producto: "bootcamp-utah-2027",
        parentId: session.sub,
        childId: hijo.id,
        childName: hijo.name,
        childBirthdate: hijo.birthdate ? hijo.birthdate.toISOString().slice(0, 10) : "",
      },
      success_url: `${base}/bootcamp/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/bootcamp?pago=cancelado`,
    });

    if (!checkout.url) {
      return NextResponse.json({ error: "Stripe no devolvió URL." }, { status: 502 });
    }
    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    console.error("[bootcamp/checkout]", e);
    return NextResponse.json(
      { error: "No se pudo abrir el pago. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
