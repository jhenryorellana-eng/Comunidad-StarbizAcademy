"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useI18n } from "@/lib/i18n/client";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { cn } from "./ui";

export function LocaleToggle({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const { locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function set(l: string) {
    if (l === locale) return;
    document.cookie = `ac_locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border p-0.5 text-[0.7rem]",
        tone === "light" ? "border-white/30" : "border-navy/15",
        pending && "opacity-60",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          className={cn(
            "rounded-full px-2 py-0.5 font-semibold uppercase transition-colors",
            locale === l
              ? "bg-cyan text-white"
              : tone === "light"
                ? "text-white/70 hover:text-white"
                : "text-muted hover:text-navy",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
