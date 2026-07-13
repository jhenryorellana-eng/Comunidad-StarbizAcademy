"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { MotionConfig } from "motion/react";
import { ToastProvider } from "@/components/Toast";
import { dictionaries, type Dict, type Locale } from "./dictionaries";

type I18nValue = {
  locale: Locale;
  dict: Dict;
  /** Instant client-side switch; the server re-render catches up in background. */
  setLocale: (l: Locale) => void;
};

const I18nContext = createContext<I18nValue>({
  locale: "es",
  dict: dictionaries.es,
  setLocale: () => {},
});

export function I18nProvider({
  locale: serverLocale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  // Client override wins until the server catches up (they converge on refresh).
  const [clientLocale, setClientLocale] = useState<Locale | null>(null);
  const locale = clientLocale ?? serverLocale;
  const setLocale = useCallback((l: Locale) => setClientLocale(l), []);

  return (
    <I18nContext.Provider value={{ locale, dict: dictionaries[locale], setLocale }}>
      <MotionConfig reducedMotion="user">
        <ToastProvider>{children}</ToastProvider>
      </MotionConfig>
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
