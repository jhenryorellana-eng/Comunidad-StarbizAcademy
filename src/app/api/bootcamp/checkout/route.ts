import { NextResponse } from "next/server";
import {
  stripe,
  stripeEnabled,
  siteUrl,
  BOOTCAMP_PRICE_CENTS,
  BOOTCAMP_CURRENCY,
} from "@/lib/stripe";
import { BOOTCAMP } from "@/lib/bootcamp";

/**
 * Abre una sesión de Stripe Checkout para la inscripción al bootcamp.
 *
 * Checkout ALOJADO a propósito: los datos de la tarjeta nunca tocan este
 * servidor, así que no hay carga de cumplimiento PCI, y Stripe resuelve 3D
 * Secure y los métodos de pago locales de cada país. Montar un formulario
 * propio con Elements no aportaría nada aquí y multiplicaría el riesgo.
 *
 * El precio va como `price_data` en línea en vez de apuntar a un Price creado
 * en la cuenta: así el mismo código funciona en prueba y en producción sin
 * tener que provisionar nada antes. Cuando el flujo esté rodado se puede
 * promover a un Product/Price de verdad para tener mejores informes.
 */
export async function POST() {
  if (!stripeEnabled || !stripe) {
    return NextResponse.json(
      { error: "Stripe no está configurado (falta STRIPE_SECRET_KEY)." },
      { status: 503 },
    );
  }

  try {
    const base = siteUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Sin lista fija de métodos: Stripe muestra los que la cuenta tenga
      // activos y sean válidos para el país del comprador.
      automatic_tax: { enabled: false },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: BOOTCAMP_CURRENCY,
            unit_amount: BOOTCAMP_PRICE_CENTS,
            product_data: {
              name: BOOTCAMP.name,
              description:
                "Inscripción: cupo en el bootcamp + carta de invitación oficial para el participante y un acompañante.",
            },
          },
        },
      ],
      // Cualquiera con el enlace puede pagar; el correo es lo único que
      // pedimos aquí. Los datos de las cartas se recogen después, ya sin la
      // presión del momento del pago.
      customer_creation: "always",
      billing_address_collection: "auto",
      success_url: `${base}/bootcamp/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/bootcamp?pago=cancelado`,
      metadata: { producto: "bootcamp-utah-2027" },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe no devolvió URL." }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[bootcamp/checkout]", e);
    return NextResponse.json(
      { error: "No se pudo abrir el pago. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
