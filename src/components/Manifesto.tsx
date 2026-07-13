"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { NightSky } from "@/components/Constellation";
import { cn } from "@/components/ui";

/*
 * El manifiesto Starbiz — sección scroll-driven:
 * el cielo se vuelve negro estrellado, el texto aparece palabra por palabra
 * con el scroll y las palabras clave se van "seleccionando" con un resaltado
 * dorado. Al final, el texto normal se desvanece dejando solo las palabras
 * clave — que leídas en orden forman el eslogan — y este se materializa
 * como cierre.
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
    isKey ? [0.05, 1] : [0.05, 1, 1, 0.08],
  );
  const y = useTransform(progress, [start, end], [12, 0]);
  // El "selector" que pasa por encima de la palabra clave
  const highlight = useTransform(progress, [end, end + 0.03], [0, 1]);

  return (
    <motion.span
      style={{ opacity, y }}
      className={cn(
        "relative inline-block",
        isKey ? "mx-[0.12em] px-[0.18em] font-bold" : "mr-[0.32em]",
      )}
    >
      {isKey && (
        <motion.span
          aria-hidden
          style={{ scaleX: highlight }}
          className="absolute inset-x-0 inset-y-[-0.06em] origin-left rounded-md bg-gradient-to-r from-cyan-bright/20 to-gold/25 ring-1 ring-gold/30"
        />
      )}
      <span
        className={cn(
          isKey &&
            "relative bg-gradient-to-r from-cyan-bright to-gold bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(251,191,36,0.35)]",
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
  const sloganOpacity = useTransform(scrollYProgress, [SLOGAN_START, SLOGAN_END], [0, 1]);
  const sloganY = useTransform(scrollYProgress, [SLOGAN_START, SLOGAN_END], [26, 0]);
  const sloganScale = useTransform(scrollYProgress, [SLOGAN_START, SLOGAN_END], [0.94, 1]);

  return (
    <section ref={ref} className="relative h-[300vh] bg-[#05070f]">
      {/* Fusión suave con el cielo navy del hero */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy to-transparent"
        aria-hidden
      />
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <NightSky />
        <div className="container-ac relative py-16">
          <motion.p style={{ opacity: kickerOpacity }} className="kicker text-gold">
            {kicker}
          </motion.p>

          <p className="mt-8 max-w-3xl font-display text-[1.55rem] font-medium leading-[1.5] text-white sm:text-4xl sm:leading-[1.45]">
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
            className="mt-14 flex items-center gap-4 sm:mt-16"
          >
            <span
              className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-gold/70"
              aria-hidden
            />
            <p className="whitespace-nowrap text-center font-serif text-xl italic sm:text-3xl">
              <span className="bg-gradient-to-r from-cyan-bright via-white to-gold bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]">
                {slogan}
              </span>
            </p>
            <svg width="22" height="22" viewBox="0 0 32 32" className="shrink-0" aria-hidden>
              <path
                d="M16 2 L18.6 13.4 L30 16 L18.6 18.6 L16 30 L13.4 18.6 L2 16 L13.4 13.4 Z"
                fill="#fbbf24"
                style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.9))" }}
              />
            </svg>
            <span
              className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/50 to-gold/70"
              aria-hidden
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
