/**
 * URL pública del sitio. UNA sola implementación.
 *
 * Vivía duplicada en `layout.tsx` y en `lib/stripe.ts`, y las dos versiones ya
 * habían empezado a separarse: la del layout usaba `??`, que NO atrapa la
 * cadena vacía. Un `NEXT_PUBLIC_SITE_URL=""` en las variables de entorno —justo
 * lo que deja alguien que crea la variable y no la rellena— hacía que
 * `new URL("")` lanzara excepción en el layout raíz. Es decir: el sitio ENTERO
 * devolviendo 500 por una variable vacía.
 *
 * De aquí salen las imágenes de Open Graph (las miniaturas al compartir por
 * WhatsApp) y las URLs de vuelta del pago de Stripe. Si apunta al sitio
 * equivocado, el enlace compartido enseña la miniatura de otro dominio y quien
 * paga aterriza donde no debe.
 */
const FALLBACK = "http://localhost:3000";

export function siteUrl(): string {
  // 1 · Lo que se declare a mano gana. Necesario con dominio propio: Vercel
  //     sólo conoce el `.vercel.app`, no `comunidad.starbizacademy.com`.
  const explicita = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicita) return normaliza(explicita);

  // 2 · En Vercel sin dominio declarado, el de producción del proyecto.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return normaliza(vercel);

  // 3 · En local.
  return FALLBACK;
}

/** Acepta `midominio.com` igual que `https://midominio.com/` y devuelve
    siempre la forma canónica: con protocolo y sin barra final. */
function normaliza(valor: string): string {
  const conProtocolo = /^https?:\/\//i.test(valor) ? valor : `https://${valor}`;
  return conProtocolo.replace(/\/+$/, "");
}
