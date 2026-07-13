"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "./ui";

const THUMB_W = 36; // px — must match the button width (w-9)
const GREET_MS = 3000;

// Lo que grita Estrellita al cambiar de idioma (se elige una al azar).
const GREETINGS: Record<Locale, string[]> = {
  es: [
    "¡Hola hola! Ahora hablamos español",
    "¡Listo! Español activado ✨",
    "¡Epa! Bienvenido al español",
    "¡Puro español desde ya! 🌟",
  ],
  en: [
    "Hi there! English mode: ON",
    "Done! Now we speak English ✨",
    "Hello hello! Welcome to English",
    "Let's gooo — English it is! 🌟",
  ],
};

function persistLocale(l: Locale) {
  document.cookie = `ac_locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

/** Estrellita — la estrella dorada de la marca, con carita. Guiña al saludar. */
function StarMascot({ wink }: { wink: boolean }) {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="star-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path
        d="M32 4 L39.8 22.6 L60 24.3 L44.7 37.4 L49.4 57 L32 46.4 L14.6 57 L19.3 37.4 L4 24.3 L24.2 22.6 Z"
        fill="url(#star-skin)"
        stroke="#b45309"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* ojos: el izquierdo guiña */}
      {wink ? (
        <path
          d="M22.5 30.5 q3.5 -3.5 7 0"
          stroke="#1a2744"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <circle cx="26" cy="30" r="2.7" fill="#1a2744" />
      )}
      <circle cx="38.5" cy="30" r="2.7" fill="#1a2744" />
      {/* sonrisa + cachetes */}
      <path
        d="M25.5 37 q6.5 5.5 13 0"
        stroke="#1a2744"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="21.5" cy="35.5" r="2" fill="#f87171" opacity="0.5" />
      <circle cx="43" cy="35.5" r="2" fill="#f87171" opacity="0.5" />
    </svg>
  );
}

/**
 * Language switch — dark glass capsule with LED gradient edge and a sliding
 * gradient thumb. On switch, Estrellita pops out and greets in the new
 * language; the client dictionary swaps instantly and the server catches up
 * in a background refresh.
 */
export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [greeting, setGreeting] = useState<{ id: number; text: string } | null>(null);
  const [wink, setWink] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => pendingTimers.forEach(clearTimeout);
  }, []);

  function set(l: Locale) {
    if (l === locale) return;
    setLocale(l); // instantáneo en cliente
    persistLocale(l);
    startTransition(() => router.refresh()); // el servidor se sincroniza detrás

    // Estrellita saluda en el idioma nuevo
    timers.current.forEach(clearTimeout);
    const texts = GREETINGS[l];
    setGreeting({ id: Date.now(), text: texts[Math.floor(Math.random() * texts.length)] });
    setWink(false);
    timers.current = [
      setTimeout(() => setWink(true), 600),
      setTimeout(() => setWink(false), 1250),
      setTimeout(() => setGreeting(null), GREET_MS),
    ];
  }

  const index = LOCALES.indexOf(locale);

  return (
    <div className={cn("relative", className)}>
      <div
        role="group"
        aria-label="Language"
        className={cn(
          // LED gradient edge
          "relative inline-flex rounded-full bg-gradient-to-r from-cyan-bright/80 via-white/20 to-gold/80 p-px",
          "shadow-[0_0_14px_rgba(34,211,238,0.25)] transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.45)]",
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

      {/* Estrellita saluda 👋 */}
      <AnimatePresence>
        {greeting && (
          <motion.div
            key={greeting.id}
            role="status"
            className="pointer-events-none absolute right-0 top-full z-50 mt-3 flex w-max max-w-[240px] items-end gap-1.5"
            initial={{ opacity: 0, y: -14, scale: 0.4, rotate: -14 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 8, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
              transition={{ duration: 0.9, delay: 0.25, ease: "easeInOut" }}
              className="drop-shadow-[0_4px_12px_rgba(251,191,36,0.45)]"
            >
              <StarMascot wink={wink} />
            </motion.div>
            <div className="relative rounded-2xl rounded-bl-sm border border-gold/40 bg-navy px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(26,39,68,0.4)]">
              <span
                className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                aria-hidden
              />
              {greeting.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
