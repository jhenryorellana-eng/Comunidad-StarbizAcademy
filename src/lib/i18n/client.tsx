"use client";

import { createContext, useContext } from "react";
import { MotionConfig } from "motion/react";
import { ToastProvider } from "@/components/Toast";
import { dictionaries, type Dict, type Locale } from "./dictionaries";

type I18nValue = { locale: Locale; dict: Dict };

const I18nContext = createContext<I18nValue>({
  locale: "en",
  dict: dictionaries.en,
});

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, dict: dictionaries[locale] }}>
      <MotionConfig reducedMotion="user">
        <ToastProvider>{children}</ToastProvider>
      </MotionConfig>
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
