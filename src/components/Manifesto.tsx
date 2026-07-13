"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutGroup,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

/*
 * El manifiesto Starbiz — "reconstrucción tipográfica cinética" (estilo
 * Boulder County · A Guide to Climate Action):
 *
 * Un párrafo grande y tenue fluye verticalmente detrás de un titular que se
 * va construyendo arriba. Cuando cada palabra clave (blanca) cruza la línea
 * del titular, se desprende de su posición real en el párrafo y viaja hasta
 * su hueco exacto dentro del titular (FLIP vía layoutId — continuidad
 * espacial real, reversible al scrollear hacia atrás). Detrás, fotografías
 * a pantalla completa con crossfade y zoom cinematográfico marcan los
 * capítulos. Al completarse el titular, baja al centro y la escena funde de
 * oscuro a claro hacia la siguiente sección.
 */

type WordDef = readonly [string, number]; // [palabra, 1 = clave]

const CHAPTERS = [
  "/hero/hero-1.jpg",
  "/hero/hero-2.jpg",
  "/hero/hero-3.jpg",
  "/hero/hero-4.jpg",
];

// Fases del scroll (progreso 0..1 de la sección)
const PARA_START = 0.08; // el párrafo empieza a viajar
const PARA_END = 0.68; // el párrafo terminó de pasar
const HOLD_END = 0.78; // titular completo, en reposo arriba
const CENTER_END = 0.92; // titular llega al centro y se queda

export function Manifesto({
  kicker,
  words,
  slogan,
}: {
  kicker: string;
  words: ReadonlyArray<WordDef>;
  slogan: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const kwRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const thresholds = useRef<number[]>([]);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const keywords = useMemo(
    () => words.filter(([, k]) => k === 1).map(([w]) => w),
    [words],
  );
  const keyIndexOf = useMemo(() => {
    const arr: number[] = [];
    let k = -1;
    for (const [, isKey] of words) {
      if (isKey === 1) k += 1;
      arr.push(isKey === 1 ? k : -1);
    }
    return arr;
  }, [words]);

  // ---- Geometría medida (sin coordenadas hardcodeadas) ----
  const paraFrom = useMotionValue(600); // px: inicio del viaje del párrafo
  const paraTo = useMotionValue(-1200); // px: fin del viaje
  const headlineBottom = useMotionValue(220); // px: línea de ensamblaje
  const centerShift = useMotionValue(200); // px: bajada del titular al centro

  const measure = useCallback(() => {
    const sticky = stickyRef.current;
    const para = paraRef.current;
    const headline = headlineRef.current;
    if (!sticky || !para || !headline) return;

    const stickyH = sticky.clientHeight;
    const hBottom = headline.offsetTop + headline.offsetHeight + 24;
    const from = stickyH * 0.62; // el párrafo asoma desde abajo del centro
    const to = hBottom - para.scrollHeight - 60; // hasta pasar la línea
    paraFrom.set(from);
    paraTo.set(Math.min(to, from - 200));
    headlineBottom.set(hBottom);
    centerShift.set(
      Math.max(0, stickyH / 2 - headline.offsetTop - headline.offsetHeight / 2),
    );

    // Umbral de desprendimiento por palabra clave: cuando su posición real
    // dentro del párrafo cruza la línea del titular (+25px según spec).
    const travel = from - Math.min(to, from - 200);
    const next: number[] = [];
    for (let j = 0; j < kwRefs.current.length; j++) {
      const el = kwRefs.current[j];
      if (!el) {
        next[j] =
          PARA_START + ((j + 1) / (keywords.length + 1)) * (PARA_END - PARA_START);
        continue;
      }
      const kwTop = el.offsetTop; // relativo al párrafo
      const dist = from + kwTop - (hBottom + 25);
      const frac = Math.min(1, Math.max(0, dist / travel));
      next[j] = PARA_START + frac * (PARA_END - PARA_START);
    }
    // Garantiza orden ascendente (lectura izquierda→derecha del titular)
    for (let j = 1; j < next.length; j++) next[j] = Math.max(next[j], next[j - 1] + 0.004);
    thresholds.current = next;
  }, [paraFrom, paraTo, headlineBottom, centerShift, keywords.length]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (stickyRef.current) ro.observe(stickyRef.current);
    if (paraRef.current) ro.observe(paraRef.current);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [measure]);

  // ---- Desprendimiento por palabra (reversible) ----
  const [detachedCount, setDetachedCount] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const t = thresholds.current;
    let n = 0;
    while (n < t.length && v > t[n]) n++;
    setDetachedCount((prev) => (prev === n ? prev : n));
  });

  // ---- Transforms de escena ----
  const paraY = useTransform(() => {
    const v = scrollYProgress.get();
    const f = Math.min(1, Math.max(0, (v - PARA_START) / (PARA_END - PARA_START)));
    return paraFrom.get() + (paraTo.get() - paraFrom.get()) * f;
  });
  const paraOpacity = useTransform(scrollYProgress, [PARA_END, HOLD_END], [1, 0]);
  const maskImage = useMotionTemplate`linear-gradient(to bottom, transparent ${headlineBottom}px, black calc(${headlineBottom}px + 30px), black 62%, rgba(0,0,0,0.28) 100%)`;

  const headlineY = useTransform(() => {
    const v = scrollYProgress.get();
    const f = Math.min(1, Math.max(0, (v - HOLD_END) / (CENTER_END - HOLD_END)));
    // easeInOut suave
    const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    return centerShift.get() * e;
  });
  const headlineScale = useTransform(scrollYProgress, [HOLD_END, CENTER_END], [1, 1.08]);
  const kickerOpacity = useTransform(scrollYProgress, [0, 0.03, 0.1, 0.16], [0, 1, 1, 0]);

  const allDetached = reduce ? keywords.length : detachedCount;
  const complete = allDetached === keywords.length;

  return (
    <section ref={sectionRef} className="relative h-[340vh] bg-[#05070f] sm:h-[500vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden">
        {/* ---- Fondos cinematográficos por capítulo (crossfade + zoom) ---- */}
        {CHAPTERS.map((src, i) => (
          <Chapter
            key={src}
            src={src}
            index={i}
            total={CHAPTERS.length}
            progress={scrollYProgress}
          />
        ))}
        {/* Overlay oscuro para contraste */}
        <div className="absolute inset-0 bg-[#05070f]/60" aria-hidden />

        <LayoutGroup>
          {/* ---- Titular en construcción (capa superior, centrado) ---- */}
          <div
            ref={headlineRef}
            className="absolute inset-x-[6vw] top-[13vh] z-20 flex justify-center sm:top-[16vh]"
          >
            <motion.div
              style={{ y: headlineY, scale: headlineScale }}
              className="w-full max-w-4xl text-center"
            >
            <motion.p style={{ opacity: kickerOpacity }} className="kicker mb-4 text-white/80">
              {kicker}
            </motion.p>
            <p
              className="flex flex-wrap justify-center gap-x-[0.28em] font-display text-[2.1rem] font-extrabold leading-[1.22] tracking-tight text-white sm:text-[3.4rem] sm:font-bold"
              aria-label={slogan}
            >
              {keywords.map((w, j) => {
                const landed = j < allDetached;
                // El titular arranca en mayúscula; el crossfade del FLIP
                // disimula el cambio de letra durante el vuelo.
                const display = j === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
                return (
                  <span key={`slot-${j}`} className="relative inline-block">
                    {/* Plantilla invisible: reserva la posición exacta */}
                    <span className={landed ? "invisible" : "opacity-0"} aria-hidden>
                      {display}
                    </span>
                    {landed && (
                      <motion.span
                        layoutId={reduce ? undefined : `kw-${j}`}
                        transition={{ type: "spring", stiffness: 150, damping: 24 }}
                        className="absolute inset-0 whitespace-nowrap [text-shadow:0_0_26px_rgba(255,255,255,0.35)]"
                      >
                        {display}
                      </motion.span>
                    )}
                    {/* Destello dorado al aterrizar */}
                    {landed && !reduce && (
                      <motion.span
                        key={`burst-${j}`}
                        initial={{ scale: 0.2, opacity: 1 }}
                        animate={{ scale: 2.1, opacity: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
                        className="pointer-events-none absolute -right-[0.25em] -top-[0.35em] text-[0.5em] text-gold"
                        aria-hidden
                      >
                        ✦
                      </motion.span>
                    )}
                  </span>
                );
              })}
            </p>
            {/* Subrayado de luz: se dibuja cuando el titular está completo */}
            <motion.span
              aria-hidden
              animate={{ scaleX: complete ? 1 : 0, opacity: complete ? 1 : 0 }}
              transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1], delay: complete ? 0.5 : 0 }}
              className="mx-auto mt-4 block h-[3px] w-2/3 origin-center rounded-full bg-gradient-to-r from-cyan-bright/0 via-cyan-bright to-gold shadow-[0_0_14px_rgba(251,191,36,0.7)]"
            />
            </motion.div>
          </div>

          {/* ---- Párrafo narrativo que fluye detrás del titular ---- */}
          <motion.div
            style={{
              opacity: paraOpacity,
              WebkitMaskImage: maskImage,
              maskImage,
            }}
            className="absolute inset-0 z-10"
            aria-hidden={allDetached === keywords.length}
          >
            <motion.p
              ref={paraRef}
              style={{ y: paraY }}
              className="absolute inset-x-[6vw] top-0 mx-auto max-w-5xl text-center text-[1.5rem] font-medium leading-[1.4] text-[#aebad8]/55 sm:text-[3.4rem] sm:leading-[1.2]"
            >
              {words.map(([w, isKey], i) => {
                if (isKey !== 1) return <span key={i}>{w} </span>;
                const j = keyIndexOf[i];
                const detached = j < allDetached;
                return (
                  <Fragment key={i}>
                    <span
                      ref={(el) => {
                        kwRefs.current[j] = el;
                      }}
                      className="relative inline-block whitespace-nowrap"
                    >
                      {/* Gemela invisible: conserva el espacio al despegar */}
                      <span className={detached ? "opacity-0" : "invisible"} aria-hidden>
                        {w}
                      </span>
                      {!detached && (
                        <motion.span
                          layoutId={reduce ? undefined : `kw-${j}`}
                          transition={{ type: "spring", stiffness: 150, damping: 24 }}
                          className="absolute inset-0 whitespace-nowrap font-bold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.55)] [text-shadow:0_0_22px_rgba(251,191,36,0.35)]"
                        >
                          {w}
                        </motion.span>
                      )}
                    </span>{" "}
                  </Fragment>
                );
              })}
            </motion.p>
          </motion.div>
        </LayoutGroup>

      </div>

      {/* ---- Puente hacia la sección clara: se cruza scrolleando, sin flash ---- */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[80vh] bg-gradient-to-b from-transparent via-cream/60 to-cream"
        aria-hidden
      />
    </section>
  );
}

/** Fotografía de capítulo: crossfade en su banda de scroll + zoom continuo. */
function Chapter({
  src,
  index,
  total,
  progress,
}: {
  src: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const bandStart = (index / total) * PARA_END;
  const bandEnd = ((index + 1) / total) * PARA_END;
  const fade = 0.045;

  const opacity = useTransform(
    progress,
    index === 0
      ? [0, bandEnd - fade, bandEnd + fade]
      : index === total - 1
        ? [bandStart - fade, bandStart + fade, 1]
        : [bandStart - fade, bandStart + fade, bandEnd - fade, bandEnd + fade],
    index === 0
      ? [0.42, 0.42, 0]
      : index === total - 1
        ? [0, 0.45, 0.45]
        : [0, 0.45, 0.45, 0],
  );
  const scale = useTransform(progress, [bandStart - fade, bandEnd + fade], [1, 1.32]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0" aria-hidden>
      <motion.img
        src={src}
        alt=""
        style={{ scale }}
        className="h-full w-full object-cover"
        loading={index === 0 ? "eager" : "lazy"}
      />
    </motion.div>
  );
}
