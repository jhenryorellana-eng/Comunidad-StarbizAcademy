"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { Icon } from "@/components/icons";
import { CountdownInline } from "./Countdown";
import { EASE } from "@/components/motion";

const DISMISS_KEY = "sba_bootcamp_ribbon_dismissed";

/**
 * Store mínimo sobre localStorage para `useSyncExternalStore`.
 *
 * Se hace así —y no con useState + useEffect— porque leer localStorage en un
 * efecto obliga a un setState síncrono dentro de él, que dispara renders en
 * cascada (react-hooks/set-state-in-effect). useSyncExternalStore está pensado
 * exactamente para esto: el servidor usa el snapshot de servidor y el cliente
 * relee al hidratar, sin desajuste.
 */
const dismissStore = {
  listeners: new Set<() => void>(),
  subscribe(cb: () => void) {
    dismissStore.listeners.add(cb);
    return () => {
      dismissStore.listeners.delete(cb);
    };
  },
  isDismissed(): boolean {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false; // localStorage bloqueado (modo privado): se muestra igual.
    }
  },
  dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* sin persistencia: vuelve a aparecer en la próxima carga */
    }
    dismissStore.listeners.forEach((l) => l());
  },
};

/** En servidor se asume descartada, así no se pinta nada hasta hidratar. */
const dismissedOnServer = () => true;

/**
 * Cinta superior con la cuenta regresiva al Bootcamp Utah 2027.
 *
 * Va ENCIMA del header (no dentro), así el header conserva su `sticky top-0`
 * y las pestañas de sección su `top-16` sin tocar el cálculo de altura.
 *
 * Se monta en cliente para no arriesgar desajuste de hidratación con
 * localStorage; en la propia página del bootcamp no se muestra.
 */
export function BootcampRibbon() {
  const dismissed = useSyncExternalStore(
    dismissStore.subscribe,
    dismissStore.isDismissed,
    dismissedOnServer,
  );
  const pathname = usePathname();
  const { dict } = useI18n();
  const B = dict.bootcamp;
  const visible = !dismissed;

  if (pathname.startsWith("/bootcamp")) return null;

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative overflow-hidden bg-navy text-white"
        >
          {/* Cielo: un cometa cyan cruzando por detrás del texto. */}
          <span
            className="comet pointer-events-none left-[-10%] top-1/2"
            style={
              {
                "--comet-len": "120px",
                "--comet-angle": "8deg",
                "--comet-period": "14s",
                "--comet-color": "rgba(34,211,238,0.9)",
                "--comet-glow": "rgba(34,211,238,0.7)",
              } as React.CSSProperties
            }
            aria-hidden
          />

          <div className="container-ac relative flex items-center gap-3 py-2">
            <Link
              href="/bootcamp"
              className="group flex min-w-0 flex-1 items-center gap-2.5 text-sm sm:gap-3"
            >
              <span
                className="animate-led h-2 w-2 shrink-0 rounded-full bg-gold shadow-[0_0_8px_2px_rgba(251,191,36,0.8)]"
                aria-hidden
              />
              <span className="truncate font-semibold">
                <span className="text-gold">{B.ribbonLabel}</span>
                <span className="mx-2 hidden text-white/30 sm:inline">·</span>
                <span className="hidden text-white/80 sm:inline">{B.ribbonDates}</span>
              </span>

              <span className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
                <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/45 sm:inline">
                  {B.tMinus}
                </span>
                <CountdownInline />
              </span>

              <span className="hidden shrink-0 items-center gap-1 rounded-full bg-cyan px-3 py-1 text-xs font-semibold transition-all group-hover:bg-cyan-bright group-hover:text-navy md:inline-flex">
                {B.ribbonCta}
                <Icon name="arrowRight" size={13} />
              </span>
            </Link>

            <button
              type="button"
              onClick={dismissStore.dismiss}
              aria-label={dict.common.close}
              className="shrink-0 rounded-full p-1 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon name="close" size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
