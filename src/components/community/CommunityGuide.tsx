"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { PLATFORM_TREE } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/components/ui";

const SEEN_KEY = "sba_guide_seen";

/* ===========================================================================
   GUÍA DE BIENVENIDA

   Quien entra por primera vez aterriza en Inicio y tiene que deducir el mapa
   solo. Esto se lo cuenta en cinco pasos.

   LA DECISIÓN QUE IMPORTA: la guía no describe el menú, lo ENSEÑA. Cada paso
   ilumina sus destinos sobre una miniatura del árbol real. Leer "Posts está en
   la barra lateral" no enseña nada; ver Posts encenderse en su sitio, sí. Por
   eso la miniatura se construye desde `PLATFORM_TREE`, la misma fuente que la
   navegación de verdad — si mañana se mueve un espacio, la guía se mueve sola.

   Cinco pasos para diez destinos, agrupados por lo que vas a HACER. Una guía de
   diez pantallas la cierra todo el mundo antes de la cuarta.

   Rendimiento, con las reglas que ya rigen el resto del proyecto:
   · Sólo se animan `transform` y `opacity`. Nada de `clip-path`, `filter` ni
     `backdrop-filter` — cada uno obliga a repintar en cada fotograma.
   · El velo es opaco liso, sin desenfoque. Un `backdrop-filter` a pantalla
     completa sobre un fondo con animaciones no para nunca de recalcularse.
=========================================================================== */

/** Store mínimo sobre localStorage para `useSyncExternalStore`.
    Leer localStorage dentro de un efecto obliga a un setState síncrono que
    dispara renders en cascada; este hook existe justo para evitarlo. */
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
      return false; // localStorage bloqueado: se muestra igual.
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

/** En servidor se asume vista: así no se pinta nada hasta hidratar y no hay
    desajuste entre lo que manda el servidor y lo que ve el navegador. */
const seenOnServer = () => true;

export function CommunityGuide() {
  const { dict } = useI18n();
  const G = dict.community.guide;
  const vista = useSyncExternalStore(seenStore.subscribe, seenStore.wasSeen, seenOnServer);

  const [paso, setPaso] = useState(0);
  const total = G.steps.length;
  const abierto = !vista;

  const cerrar = useCallback(() => {
    seenStore.markSeen();
    setPaso(0);
  }, []);

  const avanzar = useCallback(() => {
    setPaso((p) => (p + 1 < total ? p + 1 : p));
  }, [total]);

  const retroceder = useCallback(() => setPaso((p) => Math.max(0, p - 1)), []);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") avanzar();
      if (e.key === "ArrowLeft") retroceder();
    };
    document.addEventListener("keydown", onKey);
    // Se aplaza un fotograma: cambiar `overflow` en el body invalida la
    // disposición de todo el documento, y hacerlo en el mismo fotograma que
    // abre el modal hace competir el recálculo con la animación de entrada.
    const raf = requestAnimationFrame(() => {
      document.body.style.overflow = "hidden";
    });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [abierto, cerrar, avanzar, retroceder]);

  const actual = G.steps[paso];
  const ultimo = paso === total - 1;
  const comunidad = PLATFORM_TREE.find((s) => s.key === "comunidad");
  const destinos = comunidad?.children ?? [];

  return (
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          {/* Velo liso, sin desenfoque: a pantalla completa y sobre un fondo con
              animaciones, un `backdrop-filter` no para de recalcularse. */}
          <motion.div
            className="absolute inset-0 bg-navy/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.22 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            onClick={cerrar}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={G.title}
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[linear-gradient(155deg,#152744_0%,#0d1830_52%,#0a1020_100%)] shadow-[0_-8px_60px_rgba(6,10,24,0.6)] sm:rounded-3xl"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
            }}
            exit={{ opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.16 } }}
            // Arrastrar horizontalmente para cambiar de paso: en móvil es el
            // gesto que la gente ya intenta sin que nadie se lo diga.
            drag="x"
            dragElastic={0.12}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) avanzar();
              if (info.offset.x > 70) retroceder();
            }}
          >
            {/* ── CABECERA ── */}
            <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-6">
              <div className="min-w-0">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-cyan-bright">
                  {G.eyebrow}
                </p>
                <p className="mt-1 font-display text-lg font-extrabold text-white sm:text-xl">
                  {G.title}
                </p>
              </div>
              <button
                type="button"
                onClick={cerrar}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                {G.skip}
              </button>
            </div>

            {/* ── PROGRESO ──
                Barras, no puntos: la anchura dice cuánto queda, un punto no. */}
            <div className="mt-4 flex gap-1.5 px-5 sm:px-7">
              {G.steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPaso(i)}
                  aria-label={`${i + 1} ${G.stepOf} ${total}`}
                  className="group h-1 flex-1 overflow-hidden rounded-full bg-white/12"
                >
                  <span
                    className={cn(
                      "block h-full origin-left rounded-full bg-gradient-to-r from-cyan-bright to-cyan transition-transform duration-300",
                      i <= paso ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              ))}
            </div>

            {/* ── CUERPO ── */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <div className="grid gap-5 sm:grid-cols-[1fr_190px] sm:gap-7">
                {/* El texto del paso */}
                {/* `mode="wait"` encadena salida y entrada, así que cambiar de
                    paso costaba 0.12s + 0.22s antes de poder LEER el texto
                    nuevo. Con clics seguidos se ve el paso anterior colgado.
                    Ahora el bloque se sustituye de golpe y sólo funde 0.14s:
                    lo que cambia de verdad —el mapa— ya tiene su transición. */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={paso}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0, transition: { duration: 0.14 } }}
                    exit={{ opacity: 0, transition: { duration: 0.06 } }}
                  >
                    <p className="font-display text-xl font-extrabold leading-tight text-white [text-wrap:balance] sm:text-2xl">
                      {actual.title}
                    </p>
                    <p className="mt-3 text-[0.92rem] leading-relaxed text-white/65">
                      {actual.body}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {actual.highlight.map((k) => {
                        const hoja = destinos.find((d) => d.key === k);
                        if (!hoja) return null;
                        return (
                          <span
                            key={k}
                            className="inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-2.5 py-1 text-[0.72rem] font-semibold text-cyan-bright"
                          >
                            <Icon name={hoja.icon as IconName} size={12} />
                            {
                              dict.community.spaces[
                                k as keyof typeof dict.community.spaces
                              ]
                            }
                          </span>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* EL MAPA — miniatura del árbol real, con los destinos del
                    paso encendidos. Es la pieza que de verdad enseña: leer
                    "está en la barra lateral" no ubica a nadie; verlo
                    encenderse en su sitio, sí. */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5">
                  <p className="px-1.5 pb-1.5 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-white/35">
                    {G.whereIs}
                  </p>
                  <div className="flex flex-col gap-px">
                    {destinos.map((hoja) => {
                      const encendido = actual.highlight.includes(hoja.key);
                      return (
                        <div
                          key={hoja.key}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-300",
                            encendido
                              ? "bg-cyan/20 ring-1 ring-cyan-bright/40"
                              : "opacity-35",
                          )}
                        >
                          <Icon
                            name={hoja.icon as IconName}
                            size={12}
                            className={encendido ? "text-cyan-bright" : "text-white/60"}
                          />
                          <span
                            className={cn(
                              "truncate text-[0.7rem]",
                              encendido
                                ? "font-bold text-white"
                                : "font-medium text-white/70",
                            )}
                          >
                            {
                              dict.community.spaces[
                                hoja.key as keyof typeof dict.community.spaces
                              ]
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── PIE ── */}
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={retroceder}
                disabled={paso === 0}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-white/55 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-0"
              >
                <Icon name="arrowRight" size={14} className="rotate-180" />
                {G.back}
              </button>

              <span className="text-[0.7rem] font-bold tabular-nums text-white/30">
                {paso + 1} {G.stepOf} {total}
              </span>

              <button
                type="button"
                onClick={ultimo ? cerrar : avanzar}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-px",
                  ultimo
                    ? "bg-gold text-navy shadow-[0_8px_24px_-8px_rgba(251,191,36,0.7)] hover:bg-gold-300"
                    : "bg-white/12 text-white hover:bg-white/20",
                )}
              >
                {ultimo ? G.done : G.next}
                <Icon name="arrowRight" size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Reabre la guía. Se cierra una vez y se pierde para siempre si no hay forma
    de volver — y a los dos días nadie recuerda dónde estaba el chat. */
export function GuideReopenButton({ className }: { className?: string }) {
  const { dict } = useI18n();
  return (
    <button
      type="button"
      onClick={() => seenStore.reopen()}
      className={className}
    >
      <Icon name="sparkles" size={13} />
      {dict.community.guide.reopen}
    </button>
  );
}
