"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "./ui";

const THUMB_W = 36; // px — must match the button width (w-9)

function persistLocale(l: Locale) {
  document.cookie = `ac_locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

/**
 * Language switch — a dark glass capsule with an LED gradient edge and a
 * sliding gradient thumb. The client dictionary swaps instantly; the
 * server-rendered text catches up in a background refresh.
 */
export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function set(l: Locale) {
    if (l === locale) return;
    setLocale(l); // instantáneo en cliente
    persistLocale(l);
    startTransition(() => router.refresh()); // el servidor se sincroniza detrás
  }

  const index = LOCALES.indexOf(locale);

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        // LED gradient edge
        "relative inline-flex rounded-full bg-gradient-to-r from-cyan-bright/80 via-white/20 to-gold/80 p-px",
        "shadow-[0_0_14px_rgba(34,211,238,0.25)] transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.45)]",
        className,
      )}
    >
      {/* Dark glass capsule */}
      <div className="relative flex items-center rounded-full bg-navy/95 p-0.5 backdrop-blur-xl">
        {/* Specular hairline */}
        <span
          className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          aria-hidden
        />
        {/* Sliding gradient thumb */}
        <motion.span
          className={cn(
            "absolute left-0.5 top-0.5 h-[calc(100%-4px)] rounded-full bg-gradient-to-br from-cyan-bright via-cyan to-cyan-700",
            "shadow-[0_0_10px_rgba(34,211,238,0.6)]",
            pending && "animate-pulse",
          )}
          style={{ width: THUMB_W }}
          animate={{ x: index * THUMB_W }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          aria-hidden
        />
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => set(l)}
            aria-pressed={locale === l}
            className={cn(
              "relative z-10 w-9 rounded-full py-1 text-center text-[0.65rem] font-bold uppercase tracking-[0.14em] transition-colors duration-200",
              locale === l ? "text-white" : "text-white/45 hover:text-white/80",
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
