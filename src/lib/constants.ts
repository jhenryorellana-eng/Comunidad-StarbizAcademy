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

// Community spaces (left sidebar). `gated` = members only.
export const COMMUNITY_SPACES = [
  { key: "feed", href: "/community", icon: "home", gated: false },
  { key: "posts", href: "/community/posts", icon: "posts", gated: false },
  { key: "events", href: "/community/events", icon: "events", gated: false },
  { key: "store", href: "/community/store", icon: "store", gated: false },
  { key: "podcast", href: "/community/podcast", icon: "podcast", gated: false },
  { key: "chat", href: "/community/chat", icon: "chat", gated: true },
  { key: "members", href: "/community/members", icon: "members", gated: false },
  { key: "observatory", href: "/community/observatory", icon: "observatory", gated: false },
  { key: "chapters", href: "/community/chapters", icon: "chapters", gated: false },
] as const;

export const POST_CATEGORIES = ["COMMUNITY", "VOICE", "ANNOUNCEMENT"] as const;

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
