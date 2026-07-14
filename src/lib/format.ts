import type { Locale } from "./i18n/dictionaries";

const loc = (l: Locale) => (l === "es" ? "es-ES" : "en-US");

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(loc(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(loc(locale), {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDateTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(loc(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Day chip used on event rows: { day: "24", month: "JUN" } */
export function dayChip(date: Date, locale: Locale): { day: string; month: string } {
  return {
    day: new Intl.DateTimeFormat(loc(locale), { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat(loc(locale), { month: "short" })
      .format(date)
      .replace(".", "")
      .toUpperCase(),
  };
}

/** Group key like "June 2026" */
export function monthKey(date: Date, locale: Locale): string {
  const s = new Intl.DateTimeFormat(loc(locale), {
    month: "long",
    year: "numeric",
  }).format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function eventRange(start: Date, end: Date | null, locale: Locale): string {
  const startStr = formatDateTime(start, locale);
  if (!end) return startStr;
  const sameDay = start.toDateString() === end.toDateString();
  return sameDay
    ? `${startStr} – ${formatTime(end, locale)}`
    : `${startStr} – ${formatDateTime(end, locale)}`;
}

/** Compact relative time: "now", "3h", "2d", or a date for older. */
export function timeAgo(date: Date, locale: Locale): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return locale === "es" ? "ahora" : "now";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return formatDate(date, locale);
}

/**
 * Public display name: first name + last-name initial ("Mateo S.").
 * Privacy rule: the full last name never reaches a public view.
 */
export function publicName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts[0]} ${parts[parts.length - 1][0]?.toUpperCase() ?? ""}.`;
}

/** Estimated reading time in minutes (~200 words/min). */
export function readMinutes(body: string): number {
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
}

/** Edad en años cumplidos (UTC) — usada para validar cuentas de menores. */
export function ageInYears(birthdate: Date, now = new Date()): number {
  let age = now.getUTCFullYear() - birthdate.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < birthdate.getUTCMonth() ||
    (now.getUTCMonth() === birthdate.getUTCMonth() &&
      now.getUTCDate() < birthdate.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}
