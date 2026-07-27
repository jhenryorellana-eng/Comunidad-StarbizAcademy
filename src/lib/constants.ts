// Domain constants for StarbizAcademy.
// Enum-like values are Strings app-wide; these are the documented allowed values.

export const ROLES = {
  VISITOR: "VISITOR",
  MEMBER: "MEMBER", // adolescente · CEO Junior
  PARENT: "PARENT", // familia · Padres 3.0
  MENTOR: "MENTOR",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

// A member is anyone with an account that can use gated community spaces.
export const MEMBER_ROLES: Role[] = [
  ROLES.MEMBER,
  ROLES.PARENT,
  ROLES.MENTOR,
  ROLES.ADMIN,
];

// GÉNESIS i7™ — las 7 inteligencias, una por semana de cada cohorte.
// El orden es el de la metodología: todo comienza con la Espiritual.
export const INTELLIGENCES = [
  { week: 1, key: "spiritual", en: "Spiritual", es: "Espiritual" },
  { week: 2, key: "mental", en: "Mental", es: "Mental" },
  { week: 3, key: "physical", en: "Physical", es: "Física" },
  { week: 4, key: "emotional", en: "Emotional", es: "Emocional" },
  { week: 5, key: "social", en: "Social", es: "Social" },
  { week: 6, key: "financial", en: "Financial", es: "Financiera" },
  { week: 7, key: "tech", en: "Technological", es: "Tecnológica" },
] as const;

// Top-level platform sections. Each grows its own spaces like Comunidad.
// `live` = ya tiene contenido real (las demás muestran "Próximamente").
// Bootcamp va SEGUNDO a propósito: en móvil la fila arranca con sangría para
// el botón de espacios, y desde la cuarta posición ya no se ve sin arrastrar.
/* ===========================================================================
   ÁRBOL DE NAVEGACIÓN

   TRES secciones, y sólo tres. Todo cuelga de aquí — antes la misma lista vivía
   en tres sitios a la vez (la barra del header, la fila de pestañas y la barra
   lateral), y las tres competían por decir lo mismo.

   Bootcamp 2027 NO es una sección hermana: es un destino DENTRO de Comunidad,
   igual que Chat y Tienda. Antes esos dos colgaban tras un separador como si
   fueran otra cosa, y no lo son.

   Padres 3.0 y StarbizAcademy quedan vacías a propósito. Se despliegan y
   cuentan qué viene; el contenido está por decidir.
=========================================================================== */

export type NavLeaf = {
  key: string;
  href: string;
  icon: string;
  /** Sólo miembros. */
  gated?: boolean;
  /** El enlace es el índice de la sección: activo sólo con coincidencia exacta,
      porque `/comunidad` es prefijo de todas las demás rutas. */
  exact?: boolean;
  /** Se pinta en dorado: es el destino que queremos que se vea. */
  featured?: boolean;
};

export type NavSection = {
  key: string;
  base: string;
  /** false → "próximamente": se despliega pero aún no lleva a ninguna parte. */
  live: boolean;
  children: readonly NavLeaf[];
};

export const PLATFORM_TREE: readonly NavSection[] = [
  {
    key: "comunidad",
    base: "/comunidad",
    live: true,
    children: [
      { key: "home", href: "/comunidad", icon: "home", exact: true },
      { key: "posts", href: "/comunidad/posts", icon: "posts" },
      { key: "members", href: "/comunidad/miembros", icon: "members" },
      { key: "events", href: "/comunidad/eventos", icon: "events" },
      { key: "blogs", href: "/comunidad/blogs", icon: "fileText" },
      { key: "podcast", href: "/comunidad/podcast", icon: "podcast" },
      { key: "rules", href: "/comunidad/reglas", icon: "shieldCheck" },
      { key: "chat", href: "/comunidad/chat", icon: "chat", gated: true },
      { key: "store", href: "/comunidad/tienda", icon: "store" },
      { key: "bootcamp", href: "/bootcamp", icon: "star", featured: true },
    ],
  },
  { key: "padres", base: "/padres", live: false, children: [] },
  { key: "academy", base: "/academia", live: false, children: [] },
];

/** Todos los destinos, aplanados. Útil para resolver "¿dónde estoy?". */
export const NAV_LEAVES: readonly NavLeaf[] = PLATFORM_TREE.flatMap((s) => s.children);

/**
 * Qué hoja corresponde a una ruta. La más específica gana: `/comunidad/posts`
 * tiene que resolver a Posts, no a Inicio, aunque Inicio sea prefijo suyo.
 */
export function leafForPath(pathname: string): NavLeaf | undefined {
  const exacta = NAV_LEAVES.find((l) => l.exact && l.href === pathname);
  if (exacta) return exacta;
  return NAV_LEAVES.filter((l) => !l.exact && pathname.startsWith(l.href)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
}

// Post.category es String libre en la BD, así que sumar BOOTCAMP no necesita
// migración: los posts del bootcamp se filtran y se destacan por esta clave.
export const POST_CATEGORIES = [
  "COMMUNITY",
  "VOICE",
  "ANNOUNCEMENT",
  "FIRST_SALE",
  "BOOTCAMP",
] as const;

// "Mi primera venta" — structured post. The 4 answers travel JSON-encoded in
// Post.body under this shape; rendering is special-cased in the feed.
export type FirstSale = { sold: string; to: string; amount: string; learned: string };

export const EVENT_CATEGORIES = ["WEEKLY", "CHAPTER", "WORKSHOP", "SUMMIT"] as const;
export const EVENT_STATUSES = ["UPCOMING", "LIVE", "PAST"] as const;

// Store catalog (apps & services we are building).
export const PRODUCT_CATEGORIES = ["APP", "SERVICE"] as const;
export const PRODUCT_STATUSES = ["AVAILABLE", "BETA", "COMING_SOON"] as const;

export const BRAND = {
  name: "StarbizAcademy",
  est: "2026",
  base: "Utah, EE.UU.",
  tagline_es: "Un solo universo. Dos plataformas sincronizadas.",
  tagline_en: "One universe. Two platforms in sync.",
  whatsapp: "https://wa.me/13854564470?text=Hola%20Henry%2C%20me%20interesa%20StarbizAcademy",
  whatsappNumber: "13854564470",
};

/** WhatsApp link with a prefilled interest message (used by the store CTA). */
export function whatsappFor(product: string): string {
  return `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(
    `Hola Henry, me interesa ${product}`,
  )}`;
}
