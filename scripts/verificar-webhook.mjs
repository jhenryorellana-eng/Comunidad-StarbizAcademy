/**
 * Prueba del manejador del webhook.
 *
 * No hace falta ninguna clave real: `constructEvent` es criptografía local,
 * no llama a la API de Stripe. Así que se puede verificar de verdad lo que
 * importa: que la firma se comprueba, que un evento repetido no duplica fila,
 * y que una firma manipulada se rechaza.
 *
 *   npm run stripe:verificar
 */
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const SECRETO = process.env.STRIPE_WEBHOOK_SECRET;
const URL = "http://localhost:3000/api/stripe/webhook";

// El sufijo se genera aquí, no en el script de npm. Antes venía de `$RANDOM`,
// que en Windows no lo expande cmd.exe: llegaba la cadena literal "$RANDOM" y
// dos ejecuciones seguidas compartían id, así que la prueba de idempotencia se
// aprobaba sola.
const MARCA = process.argv[2] || Date.now().toString(36);
const ID_SESION = "cs_test_verificacion_local_" + MARCA;

const stripe = new Stripe("sk_test_x");
const prisma = new PrismaClient();

const sesion = {
  id: ID_SESION,
  object: "checkout.session",
  payment_status: "paid",
  payment_intent: "pi_test_verificacion_local",
  customer_details: { email: "prueba@starbizacademy.com", name: "Familia de Prueba" },
  customer_email: null,
  amount_total: 25000,
  currency: "usd",
};

function evento(tipo, objeto) {
  return JSON.stringify({
    id: "evt_test_" + MARCA,
    object: "event",
    type: tipo,
    livemode: false,
    created: 1750000000,
    data: { object: objeto },
  });
}

async function enviar(cuerpo, { romperFirma = false } = {}) {
  const cabecera = stripe.webhooks.generateTestHeaderString({
    payload: cuerpo,
    secret: SECRETO,
  });
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": romperFirma ? cabecera.replace(/,v1=./, ",v1=0") : cabecera,
    },
    body: cuerpo,
  });
  return { status: res.status, cuerpo: await res.text() };
}

const resultados = [];
const comprobar = (nombre, ok, detalle) => {
  resultados.push({ nombre, ok, detalle });
  console.log(`${ok ? "  OK  " : " FALLA"}  ${nombre}${detalle ? "  ·  " + detalle : ""}`);
};

const pagado = evento("checkout.session.completed", sesion);

// 1 · firma válida -> 200
const r1 = await enviar(pagado);
comprobar("firma válida devuelve 200", r1.status === 200, `status=${r1.status}`);

// 2 · la inscripción quedó guardada
const fila = await prisma.bootcampRegistration.findUnique({
  where: { stripeSessionId: ID_SESION },
});
comprobar(
  "la inscripción se guarda",
  Boolean(fila) && fila.status === "PAID" && fila.amountTotal === 25000,
  fila ? `${fila.email} · ${fila.amountTotal} ${fila.currency} · ${fila.status}` : "sin fila",
);

// 3 · idempotencia: Stripe reintenta, no puede duplicar
const r2 = await enviar(pagado);
const cuantas = await prisma.bootcampRegistration.count({
  where: { stripeSessionId: ID_SESION },
});
comprobar(
  "reenviar el mismo evento no duplica",
  r2.status === 200 && cuantas === 1,
  `status=${r2.status} · filas=${cuantas}`,
);

// 4 · firma manipulada -> 400 y nada tocado
const r3 = await enviar(evento("checkout.session.completed", { ...sesion, id: "cs_test_FALSA" }), {
  romperFirma: true,
});
const falsa = await prisma.bootcampRegistration.count({
  where: { stripeSessionId: "cs_test_FALSA" },
});
comprobar(
  "firma manipulada se rechaza y no escribe",
  r3.status === 400 && falsa === 0,
  `status=${r3.status} · filas=${falsa}`,
);

// 5 · sin cabecera de firma -> 400
const sinFirma = await fetch(URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: pagado,
});
comprobar("sin cabecera de firma se rechaza", sinFirma.status === 400, `status=${sinFirma.status}`);

// 6 · reembolso -> REFUNDED
const r6 = await enviar(
  evento("charge.refunded", {
    id: "ch_test_verificacion",
    object: "charge",
    payment_intent: "pi_test_verificacion_local",
  }),
);
const tras = await prisma.bootcampRegistration.findUnique({
  where: { stripeSessionId: ID_SESION },
});
comprobar(
  "un reembolso marca REFUNDED",
  r6.status === 200 && tras?.status === "REFUNDED",
  `status=${r6.status} · estado=${tras?.status}`,
);

// Limpieza: la base es la de producción, no se deja basura.
const borradas = await prisma.bootcampRegistration.deleteMany({
  where: { stripeSessionId: { startsWith: "cs_test_" } },
});
console.log(`\n  limpieza: ${borradas.count} fila(s) de prueba eliminada(s)`);

const fallos = resultados.filter((r) => !r.ok).length;
console.log(fallos === 0 ? "\n  TODO CORRECTO\n" : `\n  ${fallos} COMPROBACIÓN(ES) FALLIDA(S)\n`);
await prisma.$disconnect();
process.exit(fallos === 0 ? 0 : 1);
