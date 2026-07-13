"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from "motion/react";
import { NightSky } from "@/components/Constellation";
import { cn } from "@/components/ui";

/*
 * El manifiesto Starbiz — sección scroll-driven, centrada y editorial:
 * cielo negro estrellado, tipografía serif itálica para el relato y Sora
 * extrabold en gradiente para las palabras clave, que se van "seleccionando"
 * con un barrido dorado y una estrellita que salta encima. Al final, el
 * relato se desvanece dejando solo las palabras clave — el eslogan — y este
 * se cristaliza centrado bajo un resplandor dorado.
 */

type WordDef = readonly [string, number]; // [palabra, 1 = clave]

const REVEAL_START = 0.06;
const REVEAL_END = 0.62;
const FADE_START = 0.72;
const FADE_END = 0.86;
const SLOGAN_START = 0.86;
const SLOGAN_END = 0.94;

function Word({
  word,
  isKey,
  index,
  total,
  progress,
}: {
  word: string;
  isKey: boolean;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = REVEAL_START + (index / total) * (REVEAL_END - REVEAL_START);
  const end = start + 0.035;

  // Las palabras normales se desvanecen al final; las clave permanecen.
  const opacity = useTransform(
    progress,
    isKey ? [start, end] : [start, end, FADE_START, FADE_END],
    isKey ? [0.04, 1] : [0.04, 1, 1, 0.07],
  );
  const y = useTransform(progress, [start, end], [16, 0]);
  // Revelado cinematográfico: de desenfocado a nítido (numérico + template
  // para que no lo capture el optimizador de scroll y quede congelado)
  const blurPx = useTransform(progress, [start, end], [9, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  // El "selector" que barre la palabra clave + su estrellita
  const highlight = useTransform(progress, [end, end + 0.03], [0, 1]);

  return (
    <motion.span
      style={{ opacity, y, filter }}
      className={cn(
        "relative inline-block",
        isKey ? "mx-[0.14em] px-[0.18em]" : "mr-[0.3em]",
      )}
    >
      {isKey && (
        <>
          <motion.span
            aria-hidden
            style={{ scaleX: highlight }}
            className="absolute inset-x-0 inset-y-[-0.04em] origin-left rounded-lg bg-gradient-to-r from-cyan-bright/15 to-gold/20 ring-1 ring-gold/30"
          />
          {/* Estrellita que salta al seleccionarse */}
          <motion.span
            aria-hidden
            style={{ scale: highlight, opacity: highlight }}
            className="absolute -top-[0.55em] left-1/2 -translate-x-1/2 text-[0.45em] text-gold drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]"
          >
            ✦
          </motion.span>
        </>
      )}
      <span
        className={cn(
          isKey &&
            "relative bg-gradient-to-r from-cyan-bright via-white to-gold bg-clip-text font-display font-extrabold not-italic tracking-tight text-transparent drop-shadow-[0_0_18px_rgba(251,191,36,0.4)]",
        )}
      >
        {word}
      </span>
    </motion.span>
  );
}

export function Manifesto({
  kicker,
  words,
  slogan,
}: {
  kicker: string;
  words: ReadonlyArray<WordDef>;
  slogan: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const kickerOpacity = useTransform(scrollYProgress, [0.02, 0.08], [0, 1]);
  const readProgress = useTransform(scrollYProgress, [REVEAL_START, REVEAL_END], [0, 1]);
  const sloganOpacity = useTransform(scrollYProgress, [SLOGAN_START, SLOGAN_END], [0, 1]);
  const sloganY = useTransform(scrollYProgress, [SLOGAN_START, SLOGAN_END], [30, 0]);
  const sloganScale = useTransform(scrollYProgress, [SLOGAN_START, SLOGAN_END], [0.92, 1]);
  const bigStarRotate = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const bigStarOpacity = useTransform(scrollYProgress, [0.05, 0.3], [0, 1]);

  return (
    <section ref={ref} className="relative h-[300vh] bg-[#05070f]">
      {/* Fusión suave con el cielo navy del hero */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy to-transparent"
        aria-hidden
      />
      <div className="sticky top-0 flex h-screen items-center overflow-hidden pt-16">
        <NightSky />

        {/* Estrella gigante de fondo, rotando con el scroll */}
        <motion.div
          style={{ rotate: bigStarRotate, opacity: bigStarOpacity }}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        >
          <svg width="620" height="620" viewBox="0 0 32 32" className="max-w-[90vw]">
            <path
              d="M16 1 L19 12.5 L31 16 L19 19.5 L16 31 L13 19.5 L1 16 L13 12.5 Z"
              fill="none"
              stroke="rgba(251,191,36,0.07)"
              strokeWidth="0.35"
            />
            <path
              d="M16 6 L18 13.8 L26 16 L18 18.2 L16 26 L14 18.2 L6 16 L14 13.8 Z"
              fill="none"
              stroke="rgba(34,211,238,0.05)"
              strokeWidth="0.3"
            />
          </svg>
        </motion.div>

        <div className="container-ac relative py-16 text-center">
          {/* Kicker centrado con líneas y barra de lectura */}
          <motion.div style={{ opacity: kickerOpacity }} className="mx-auto max-w-md">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" aria-hidden />
              <p className="kicker text-gold">{kicker}</p>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" aria-hidden />
            </div>
            <div className="mx-auto mt-3 h-[3px] w-36 overflow-hidden rounded-full bg-white/10">
              <motion.span
                style={{ scaleX: readProgress }}
                className="block h-full origin-left rounded-full bg-gradient-to-r from-cyan-bright to-gold shadow-[0_0_8px_rgba(251,191,36,0.7)]"
              />
            </div>
          </motion.div>

          {/* El relato: serif itálica editorial, centrado */}
          <p className="mx-auto mt-8 max-w-4xl text-center font-serif text-[1.45rem] italic leading-[1.6] text-white/90 sm:mt-10 sm:text-[2.2rem] sm:leading-[1.5]">
            {words.map(([w, k], i) => (
              <Word
                key={`${i}-${w}`}
                word={w}
                isKey={k === 1}
                index={i}
                total={words.length}
                progress={scrollYProgress}
              />
            ))}
          </p>

          {/* El eslogan se cristaliza al final, formado por las palabras clave */}
          <motion.div
            style={{ opacity: sloganOpacity, y: sloganY, scale: sloganScale }}
            className="relative mx-auto mt-10 max-w-2xl sm:mt-12"
          >
            {/* Resplandor dorado tras el eslogan */}
            <span
              className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl"
              aria-hidden
            />
            <div className="relative flex items-center gap-4">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-gold/70" aria-hidden />
              <svg width="20" height="20" viewBox="0 0 32 32" className="shrink-0" aria-hidden>
                <path
                  d="M16 2 L18.6 13.4 L30 16 L18.6 18.6 L16 30 L13.4 18.6 L2 16 L13.4 13.4 Z"
                  fill="#fbbf24"
                  style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.9))" }}
                />
              </svg>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/50 to-gold/70" aria-hidden />
            </div>
            <p className="mt-5 text-center font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-cyan-bright via-white to-gold bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(251,191,36,0.4)]">
                {slogan}
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
