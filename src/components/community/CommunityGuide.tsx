"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { Icon } from "@/components/icons";

const SEEN_KEY = "sba_guide_seen";

/* ===========================================================================
   GUÍA — SEÑALES, NO UN MODAL

   La primera versión era un modal a pantalla completa que se plantaba delante
   antes de dejar ver nada. Contaba bien el mapa, pero le pedía a alguien que
   acaba de llegar que se leyera cinco pantallas antes de mirar la página. Eso
   es exactamente lo que hace que se cierren las guías sin leerlas.

   Ahora el usuario entra normal, ve Inicio, y aparece UNA burbuja pequeña
   señalando un elemento real: el logo, el menú, el idioma, el botón de unirse.
   Cuatro señales de una frase. Se puede seguir usando la página con la guía
   abierta — no hay velo que bloquee ni scroll bloqueado.

   CÓMO ENCUENTRA LOS ELEMENTOS: por `data-tour` en el componente real, no por
   clases ni por posición. Las clases de estilo cambian cada semana; el atributo
   dice para qué está ahí. Si un paso no encuentra su elemento —el botón de
   unirse no existe si ya iniciaste sesión— ese paso simplemente se salta.

   El recuadro que rodea al elemento es un `box-shadow` enorme y FIJO: dibuja
   el halo y oscurece todo lo demás de una sola vez, sin una segunda capa y sin
   nada que se repinte por fotograma.
=========================================================================== */

/** Orden de los pasos. La clave es el `data-tour` del elemento al que apunta. */
const PASOS = ["logo", "nav", "locale", "join"] as const;
type Paso = (typeof PASOS)[number];

const seenStore = {
  listeners: new Set<() => void>(),
  subscribe(cb: () => void) {
    seenStore.listeners.add(cb);
    return () => {
      seenStore.listeners.delete(cb);
    };
  },
  wasSeen(): boolean {
    try {
      return localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      return false;
    }
  },
  markSeen() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* sin persistencia: reaparece en la próxima visita */
    }
    seenStore.listeners.forEach((l) => l());
  },
  reopen() {
    try {
      localStorage.removeItem(SEEN_KEY);
    } catch {
      /* nada */
    }
    seenStore.listeners.forEach((l) => l());
  },
};

/** En servidor se asume vista: nada se pinta hasta hidratar, sin desajuste. */
const seenOnServer = () => true;

type Caja = { top: number; left: number; width: number; height: number };

/** Rectángulo del elemento VISIBLE con ese `data-tour`.
    Hay dos anclas para `nav` —la barra lateral en escritorio y el botón en
    móvil— y sólo una está pintada según el ancho. */
function cajaDe(clave: string): Caja | null {
  const nodos = [...document.querySelectorAll<HTMLElement>(`[data-tour="${clave}"]`)];
  const visible = nodos.find((n) => n.offsetParent !== null || n.getClientRects().length);
  if (!visible) return null;
  const r = visible.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function CommunityGuide() {
  const { dict } = useI18n();
  const G = dict.community.guide;
  const vista = useSyncExternalStore(seenStore.subscribe, seenStore.wasSeen, seenOnServer);

  const [i, setI] = useState(0);
  const [caja, setCaja] = useState<Caja | null>(null);
  const abierta = !vista;

  const cerrar = useCallback(() => {
    seenStore.markSeen();
    setI(0);
  }, []);

  // Avanza saltando los pasos cuyo elemento no está en pantalla.
  const siguienteIndice = useCallback((desde: number): number => {
    for (let n = desde; n < PASOS.length; n++) {
      if (cajaDe(PASOS[n])) return n;
    }
    return -1;
  }, []);

  const avanzar = useCallback(() => {
    const n = siguienteIndice(i + 1);
    if (n === -1) cerrar();
    else setI(n);
  }, [i, siguienteIndice, cerrar]);

  // Medir el elemento del paso actual, y volver a medir si cambia la ventana.
  useEffect(() => {
    if (!abierta) return;

    let vivo = true;
    const medir = () => {
      if (!vivo) return;
      const n = siguienteIndice(i);
      if (n === -1) {
        cerrar();
        return;
      }
      if (n !== i) {
        setI(n);
        return;
      }
      setCaja(cajaDe(PASOS[i]));
    };

    // Un fotograma de margen: al abrir, la barra lateral aún puede estar
    // entrando y su rectángulo sería el de mitad de animación.
    const raf = requestAnimationFrame(medir);
    window.addEventListener("resize", medir);
    window.addEventListener("scroll", medir, { passive: true });
    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", medir);
      window.removeEventListener("scroll", medir);
    };
  }, [abierta, i, siguienteIndice, cerrar]);

  useEffect(() => {
    if (!abierta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight" || e.key === "Enter") avanzar();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierta, cerrar, avanzar]);

  if (!abierta || !caja) return null;

  const clave = PASOS[i] as Paso;
  const texto = G.tips[clave];
  const ultimo = siguienteIndice(i + 1) === -1;

  // La burbuja va debajo del elemento salvo que no quepa, y se mantiene dentro
  // de la ventana por los lados.
  const margen = 12;
  const anchoBurbuja = 268;
  const debajo = caja.top + caja.height + margen;
  const cabeDebajo = debajo + 150 < window.innerHeight;
  const top = cabeDebajo ? debajo : Math.max(margen, caja.top - 150 - margen);
  const centro = caja.left + caja.width / 2;
  const left = Math.min(
    Math.max(margen, centro - anchoBurbuja / 2),
    window.innerWidth - anchoBurbuja - margen,
  );

  // Portal a <body>. Un `z-index` alto no basta: la guía vive dentro del layout
  // de la comunidad, y basta un ancestro con `transform` u `opacity` para crear
  // un contexto de apilamiento que lo atrapa. Se veía: la barra de ubicación
  // (z-30) se pintaba ENCIMA de la burbuja (z-60). Sacándola a body no hay
  // ancestro que la contenga.
  return createPortal(
    <AnimatePresence>
      <div className="pointer-events-none fixed inset-0 z-[60]">
        {/* EL RECUADRO. Un solo elemento hace las dos cosas: el halo alrededor
            del objetivo y el oscurecido de todo lo demás, con una sombra
            gigante y fija. Sin segunda capa y sin nada que repintar. */}
        <motion.div
          key={`halo-${clave}`}
          className="absolute rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0 }}
          style={{
            top: caja.top - 6,
            left: caja.left - 6,
            width: caja.width + 12,
            height: caja.height + 12,
            boxShadow:
              "0 0 0 2px rgba(34,211,238,0.9), 0 0 22px 2px rgba(34,211,238,0.45), 0 0 0 9999px rgba(10,16,32,0.62)",
          }}
          aria-hidden
        />

        {/* LA BURBUJA */}
        <motion.div
          key={`tip-${clave}`}
          role="dialog"
          aria-live="polite"
          // `z-10` no es cosmético: el halo dibuja el oscurecido con una sombra
          // de 9999px que se derrama sobre TODO, incluida esta burbuja, y el
          // texto quedaba lavado. Con la burbuja por encima, el velo se queda
          // donde debe — detrás.
          className="pointer-events-auto absolute z-10 rounded-2xl border border-cyan/40 bg-[linear-gradient(155deg,#182c4c_0%,#0e1a33_100%)] p-4 shadow-[0_18px_48px_-12px_rgba(6,10,24,0.9)]"
          style={{ top, left, width: anchoBurbuja }}
          initial={{ opacity: 0, y: cabeDebajo ? -8 : 8, scale: 0.97 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
          }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
        >
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan text-white">
              <Icon name="sparkles" size={12} />
            </span>
            <p className="text-[0.86rem] leading-snug text-white/85">{texto}</p>
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-2">
            <div className="flex gap-1" aria-hidden>
              {PASOS.map((p, n) => (
                <span
                  key={p}
                  className={
                    n === i
                      ? "h-1.5 w-4 rounded-full bg-cyan-bright"
                      : "h-1.5 w-1.5 rounded-full bg-white/25"
                  }
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={cerrar}
                className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-white/45 transition-colors hover:text-white"
              >
                {G.skip}
              </button>
              <button
                type="button"
                onClick={avanzar}
                className="inline-flex items-center gap-1.5 rounded-full bg-cyan px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-cyan-bright hover:text-navy"
              >
                {ultimo ? G.done : G.next}
                {!ultimo && <Icon name="arrowRight" size={12} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}

/** Reabre la guía. Sin esto se cierra una vez y se pierde para siempre. */
export function GuideReopenButton({ className }: { className?: string }) {
  const { dict } = useI18n();
  return (
    <button type="button" onClick={() => seenStore.reopen()} className={className}>
      <Icon name="sparkles" size={13} />
      {dict.community.guide.reopen}
    </button>
  );
}
