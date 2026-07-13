"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const CENTER_END = 0.9; // titular llega al centro
const LIGHT_START = 0.88; // comienza el fundido a claro
const FADE_OUT = [0.95, 0.995] as const; // el titular se despide

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
  const maskImage = useMotionTemplate`linear-gradient(to bottom, transparent ${headlineBottom}px, black calc(${headlineBottom}px + 30px))`;

  const headlineY = useTransform(() => {
    const v = scrollYProgress.get();
    const f = Math.min(1, Math.max(0, (v - HOLD_END) / (CENTER_END - HOLD_END)));
    // easeInOut suave
    const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    return centerShift.get() * e;
  });
  const headlineScale = useTransform(scrollYProgress, [HOLD_END, CENTER_END], [1, 1.06]);
  const headlineOpacity = useTransform(scrollYProgress, [FADE_OUT[0], FADE_OUT[1]], [1, 0]);
  const kickerOpacity = useTransform(scrollYProgress, [0, 0.03, 0.1, 0.16], [0, 1, 1, 0]);
  // Fundido de oscuro a claro hacia la sección siguiente (crema)
  const lightOpacity = useTransform(scrollYProgress, [LIGHT_START, 0.985], [0, 1]);
  const darkOverlay = useTransform(scrollYProgress, [LIGHT_START, 0.97], [0.62, 0.15]);

  const allDetached = reduce ? keywords.length : detachedCount;

  return (
    <section ref={sectionRef} className="relative h-[420vh] bg-[#05070f] sm:h-[500vh]">
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
        {/* Overlay oscuro para contraste, se abre en la fase clara */}
        <motion.div
          style={{ opacity: darkOverlay }}
          className="absolute inset-0 bg-[#05070f]"
          aria-hidden
        />

        <LayoutGroup>
          {/* ---- Titular en construcción (capa superior) ---- */}
          <motion.div
            ref={headlineRef}
            style={{ y: headlineY, scale: headlineScale, opacity: headlineOpacity }}
            className="absolute inset-x-[6.5vw] top-[16vh] z-20 origin-left"
          >
            <motion.p style={{ opacity: kickerOpacity }} className="kicker mb-4 text-white/80">
              {kicker}
            </motion.p>
            <p
              className="flex flex-wrap gap-x-[0.28em] font-display text-[2rem] font-bold leading-[1.2] tracking-tight text-white sm:text-[3.4rem]"
              aria-label={slogan}
            >
              {keywords.map((w, j) => {
                const landed = j < allDetached;
                return (
                  <span
                    key={`slot-${j}`}
                    className={"relative inline-block" + (j === 0 ? " capitalize" : "")}
                  >
                    {/* Plantilla invisible: reserva la posición exacta */}
                    <span className={landed ? "invisible" : "opacity-0"} aria-hidden>
                      {w}
                    </span>
                    {landed && (
                      <motion.span
                        layoutId={reduce ? undefined : `kw-${j}`}
                        transition={{ type: "spring", stiffness: 150, damping: 24 }}
                        className="absolute inset-0 whitespace-nowrap"
                      >
                        {w}
                      </motion.span>
                    )}
                  </span>
                );
              })}
            </p>
          </motion.div>

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
              className="absolute inset-x-[6.5vw] top-0 max-w-5xl text-[2rem] font-medium leading-[1.25] text-white/15 sm:text-[3.6rem] sm:leading-[1.2]"
            >
              {words.map(([w, isKey], i) => {
                if (isKey !== 1) return <span key={i}>{w} </span>;
                const j = keyIndexOf[i];
                const detached = j < allDetached;
                return (
                  <span
                    key={i}
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
                        className="absolute inset-0 whitespace-nowrap font-bold text-white"
                      >
                        {w}
                      </motion.span>
                    )}
                    <span aria-hidden> </span>
                  </span>
                );
              })}
            </motion.p>
          </motion.div>
        </LayoutGroup>

        {/* ---- Fundido final hacia la sección clara ---- */}
        <motion.div
          style={{ opacity: lightOpacity }}
          className="pointer-events-none absolute inset-0 z-30 bg-cream"
          aria-hidden
        />
      </div>
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
  const scale = useTransform(progress, [bandStart - fade, bandEnd + fade], [1, 1.45]);

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
