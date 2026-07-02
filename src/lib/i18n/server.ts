import "server-only";
import { cookies } from "next/headers";
import { dictionaries, DEFAULT_LOCALE, type Locale } from "./dictionaries";

export const LOCALE_COOKIE = "ac_locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return v === "es" || v === "en" ? v : DEFAULT_LOCALE;
}

export async function getDict(): Promise<{ locale: Locale; dict: typeof dictionaries.en }> {
  const locale = await getLocale();
  return { locale, dict: dictionaries[locale] };
}
