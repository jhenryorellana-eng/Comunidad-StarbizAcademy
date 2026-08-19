import "server-only";
import Stripe from "stripe";

/* ===========================================================================
   Cliente de Stripe (sólo servidor).

   La clave NUNCA se escribe aquí ni en ningún archivo versionado: sale de
   `STRIPE_SECRET_KEY` en `.env`, que está en .gitignore.

   Se empieza con la clave de PRUEBA (`sk_test_…`). Cuando el flujo esté
   validado de punta a punta se cambia por la de producción y no hace falta
   tocar ni una línea de código.
=========================================================================== */

const key = process.env.STRIPE_SECRET_KEY;

/** true cuando hay clave configurada. Permite que la página siga funcionando
    —con el CTA de WhatsApp— mientras Stripe no esté listo. */
export const stripeEnabled = Boolean(key);

export const stripe = key
  ? new Stripe(key, {
      // Sin fijar `apiVersion`: se usa la de la cuenta, que es la que Stripe
      // mantiene al día. Fijarla a mano es una fuente clásica de sorpresas.
      typescript: true,
      appInfo: { name: "StarbizAcademy", url: "https://starbizacademy.com" },
    })
  : null;

/** Estamos operando contra dinero real. */
export const stripeIsLive = Boolean(key?.startsWith("sk_live_"));

// Aviso al arrancar. Con la clave de producción cada clic en "pagar" mueve
// dinero de verdad, y es demasiado fácil pegarla sin darse cuenta.
if (stripeIsLive) {
  console.warn(
    "\n  ⚠  STRIPE EN MODO PRODUCCIÓN — los pagos son reales.\n" +
      "     Para probar sin cobrar, usa la clave sk_test_… en .env\n",
  );
}

/** Precio de la inscripción, en la unidad mínima (25000 = $250.00). */
export const BOOTCAMP_PRICE_CENTS = 25000;
export const BOOTCAMP_CURRENCY = "usd";

// La URL base vive en `lib/site.ts`, compartida con el layout: son la misma
// pregunta —¿en qué dominio corre esto?— y tener dos respuestas era pedir que
// se separaran, como ya había pasado.
export { siteUrl } from "./site";
