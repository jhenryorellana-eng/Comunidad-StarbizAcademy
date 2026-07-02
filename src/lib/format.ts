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
