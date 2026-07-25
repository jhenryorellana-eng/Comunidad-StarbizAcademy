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
export const PLATFORM_SECTIONS = [
  { key: "comunidad", href: "/comunidad/posts", base: "/comunidad", live: true },
  { key: "bootcamp", href: "/bootcamp", base: "/bootcamp", live: true },
  { key: "padres", href: "/padres", base: "/padres", live: false },
  { key: "academy", href: "/academia", base: "/academia", live: false },
] as const;

// Community spaces (left sidebar), in the PDF-spec order: activity first.
// `gated` = members only. `extra` = shown after a divider (and inside "Más" on mobile).
export const COMMUNITY_SPACES = [
  { key: "posts", href: "/comunidad/posts", icon: "posts", gated: false, extra: false },
  { key: "members", href: "/comunidad/miembros", icon: "members", gated: false, extra: false },
  { key: "events", href: "/comunidad/eventos", icon: "events", gated: false, extra: false },
  { key: "blogs", href: "/comunidad/blogs", icon: "fileText", gated: false, extra: false },
  { key: "podcast", href: "/comunidad/podcast", icon: "podcast", gated: false, extra: false },
  { key: "rules", href: "/comunidad/reglas", icon: "shieldCheck", gated: false, extra: false },
  { key: "store", href: "/comunidad/tienda", icon: "store", gated: false, extra: true },
  { key: "chat", href: "/comunidad/chat", icon: "chat", gated: true, extra: true },
] as const;

// Mobile bottom bar: first 3 spaces + "Más" (the rest live in the sheet).
export const MOBILE_BAR_KEYS = ["posts", "members", "events"] as const;

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
