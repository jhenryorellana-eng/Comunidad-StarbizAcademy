"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "./ui";

const THUMB_W = 36; // px — must match the button width (w-9)
const GREET_MS = 3200;

// Lo que dice Estrellita al asomarse (se elige una al azar).
const GREETINGS: Record<Locale, string[]> = {
  es: [
    "¡Hola! Ahora hablamos español",
    "¡Listo! Español activado ✨",
    "¡Epa! Bienvenido al español",
    "¡Puro español desde ya! 🌟",
  ],
  en: [
    "Hi there! English mode: ON",
    "Done! Now we speak English ✨",
    "Hello hello! English it is",
    "Let's gooo — English time! 🌟",
  ],
};

function persistLocale(l: Locale) {
  document.cookie = `ac_locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

// Fuera del componente: el linter de pureza de React no permite
// Date.now/Math.random dentro del cuerpo del componente.
let greetSeq = 0;
function pickGreeting(l: Locale): { id: number; text: string } {
  const texts = GREETINGS[l];
  greetSeq += 1;
  return { id: greetSeq, text: texts[Math.floor(Math.random() * texts.length)] };
}

/**
 * Estrellita asomándose: cabecita dorada de estrella con ojitos y manitas
 * agarradas al borde de la cápsula. Diseñada para verse ~18px por encima.
 */
function StarPeek({ wink }: { wink: boolean }) {
  return (
    <svg width="46" height="22" viewBox="0 0 46 22" aria-hidden>
      <defs>
        <linearGradient id="peek-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* puntas laterales de la estrella */}
      <path d="M8 19 L1 14.5 L9.5 12 Z" fill="url(#peek-skin)" stroke="#b45309" strokeWidth="1" strokeLinejoin="round" />
      <path d="M38 19 L45 14.5 L36.5 12 Z" fill="url(#peek-skin)" stroke="#b45309" strokeWidth="1" strokeLinejoin="round" />
      {/* punta superior */}
      <path d="M23 0.5 L19.5 7.5 L26.5 7.5 Z" fill="url(#peek-skin)" stroke="#b45309" strokeWidth="1" strokeLinejoin="round" />
      {/* cabeza (domo) */}
      <path d="M6 22 A17 16 0 0 1 40 22 Z" fill="url(#peek-skin)" stroke="#b45309" strokeWidth="1.2" />
      {/* ojitos — el izquierdo guiña */}
      {wink ? (
        <path d="M14.5 13.5 q2.8 -2.8 5.6 0" stroke="#1a2744" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <circle cx="17.3" cy="13" r="2.2" fill="#1a2744" />
      )}
      <circle cx="28.7" cy="13" r="2.2" fill="#1a2744" />
      {/* sonrisita + cachetes */}
      <path d="M20 17.5 q3 2.6 6 0" stroke="#1a2744" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="12.5" cy="16.5" r="1.6" fill="#f87171" opacity="0.5" />
      <circle cx="33.5" cy="16.5" r="1.6" fill="#f87171" opacity="0.5" />
      {/* manitas agarradas al borde */}
      <rect x="7" y="18.5" width="8" height="5" rx="2.5" fill="#fcd34d" stroke="#b45309" strokeWidth="1" />
      <rect x="31" y="18.5" width="8" height="5" rx="2.5" fill="#fcd34d" stroke="#b45309" strokeWidth="1" />
    </svg>
  );
}

/**
 * Language switch — dark glass capsule with LED gradient edge and a sliding
 * gradient thumb. On switch, Estrellita peeks out from behind the capsule,
 * waves and hides again; the client dictionary swaps instantly and the
 * server catches up in a background refresh.
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

    // Estrellita se asoma, saluda y se esconde
    timers.current.forEach(clearTimeout);
    setGreeting(pickGreeting(l));
    setWink(false);
    timers.current = [
      setTimeout(() => setWink(true), 900),
      setTimeout(() => setWink(false), 1500),
      setTimeout(() => setGreeting(null), GREET_MS),
    ];
  }

  const index = LOCALES.indexOf(locale);

  return (
    <div className={cn("relative", className)}>
      {/* Ventana de asomado: recorta a Estrellita justo en el borde superior
          de la cápsula, para que parezca que sale desde atrás. */}
      <div
        className="pointer-events-none absolute bottom-[calc(100%-4px)] left-1/2 h-[20px] w-14 -translate-x-1/2 overflow-hidden"
        aria-hidden
      >
        <AnimatePresence>
          {greeting && (
            <motion.div
              key={greeting.id}
              className="absolute inset-x-0 bottom-0 flex justify-center"
              initial={{ y: 26 }}
              animate={{ y: [26, 1, 3] }}
              exit={{ y: 26, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
              transition={{ duration: 0.55, times: [0, 0.7, 1], ease: [0.32, 0.72, 0, 1] }}
            >
              <motion.div
                animate={{ rotate: [0, -6, 6, -4, 0] }}
                transition={{ duration: 0.8, delay: 0.55, ease: "easeInOut" }}
              >
                <StarPeek wink={wink} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Globo de saludo, al costado izquierdo del selector */}
      <AnimatePresence>
        {greeting && (
          <motion.div
            key={`bubble-${greeting.id}`}
            role="status"
            className="pointer-events-none absolute right-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2"
            initial={{ opacity: 0, x: 10, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 6, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 26, delay: 0.35 }}
          >
            <div className="relative whitespace-nowrap rounded-2xl rounded-br-sm border border-gold/40 bg-navy px-3.5 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(26,39,68,0.4)]">
              <span
                className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                aria-hidden
              />
              {greeting.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cápsula (delante de Estrellita: z-10) */}
      <div
        role="group"
        aria-label="Language"
        className={cn(
          "relative z-10 inline-flex rounded-full bg-gradient-to-r from-cyan-bright/80 via-white/20 to-gold/80 p-px",
          "shadow-[0_0_14px_rgba(34,211,238,0.25)] transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.45)]",
        )}
      >
        <div className="relative flex items-center rounded-full bg-navy p-0.5">
          <span
            className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            aria-hidden
          />
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
    </div>
  );
}
