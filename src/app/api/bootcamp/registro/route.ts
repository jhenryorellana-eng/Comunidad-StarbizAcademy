import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Guarda los datos para las dos cartas de invitación.
 *
 * Sólo se aceptan si la sesión de Stripe existe Y está pagada: se comprueba
 * contra la API de Stripe, no contra lo que diga el navegador. Sin eso,
 * cualquiera podría inventarse un `sessionId` y crear inscripciones falsas.
 */
const Datos = z.object({
  sessionId: z.string().min(10),
  participantName: z.string().trim().min(3).max(120),
  participantBirthdate: z.string().min(8).max(10),
  companionName: z.string().trim().min(3).max(120),
  phone: z.string().trim().min(6).max(30),
  country: z.string().trim().min(2).max(60),
});

export async function POST(req: Request) {
  if (!stripeEnabled || !stripe) {
    return NextResponse.json({ error: "Stripe no configurado." }, { status: 503 });
  }

  const parsed = Datos.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }
  const d = parsed.data;

  // La verdad sobre el pago la tiene Stripe, no el cliente.
  let pagada = false;
  try {
    const s = await stripe.checkout.sessions.retrieve(d.sessionId);
    pagada = s.payment_status === "paid";
  } catch {
    return NextResponse.json({ error: "Sesión de pago no encontrada." }, { status: 404 });
  }
  if (!pagada) {
    return NextResponse.json({ error: "Ese pago no está confirmado." }, { status: 402 });
  }

  const nacimiento = new Date(d.participantBirthdate);
  if (Number.isNaN(nacimiento.getTime())) {
    return NextResponse.json({ error: "Fecha de nacimiento no válida." }, { status: 400 });
  }

  await prisma.bootcampRegistration.update({
    where: { stripeSessionId: d.sessionId },
    data: {
      participantName: d.participantName,
      participantBirthdate: nacimiento,
      companionName: d.companionName,
      phone: d.phone,
      country: d.country,
      profileComplete: true,
    },
  });

  return NextResponse.json({ ok: true });
}
