"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  LayoutGroup,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { NightSky } from "@/components/Constellation";
import { cn } from "@/components/ui";

/*
 * El manifiesto Starbiz — sección scroll-driven, centrada y editorial:
 * cielo negro estrellado, relato en serif itálica y palabras clave en Sora
 * con gradiente aurora (rosa→violeta→cyan) que se van "seleccionando" con un
 * barrido luminoso. Al final, las palabras clave VUELAN desde el párrafo y se
 * juntan en el centro formando el eslogan completo (layoutId + resorte);
 * al scrollear hacia atrás regresan a su sitio.
 */

type WordDef = readonly [string, number]; // [palabra, 1 = clave]

const REVEAL_START = 0.06;
const REVEAL_END = 0.6;
const FADE_START = 0.68;
const FADE_END = 0.8;
const GATHER_AT = 0.8; // aquí las claves vuelan a formar el eslogan

const LITE_QUERY = "(max-width: 640px)";

/** true en pantallas pequeñas — ahí se omiten los efectos caros de GPU. */
function useLite(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(LITE_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(LITE_QUERY).matches,
    () => false,
  );
}

/** Gradiente aurora compartido por claves y eslogan. */
const AURORA_TEXT =
  "bg-gradient-to-r from-[#f472b6] via-[#a78bfa] to-[#22d3ee] bg-clip-text text-transparent";

function Word({
  word,
  isKey,
  keyIndex,
  index,
  total,
  progress,
  lite,
  gathered,
}: {
  word: string;
  isKey: boolean;
  keyIndex: number;
  index: number;
  total: number;
  progress: MotionValue<number>;
  lite: boolean;
  gathered: boolean;
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
  // Revelado cinematográfico numérico (template para que no lo congele el
  // optimizador de scroll)
  const blurPx = useTransform(progress, [start, end], [9, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  // El "selector" que barre la palabra clave + su chispa
  const highlight = useTransform(progress, [end, end + 0.03], [0, 1]);

  return (
    <motion.span
      // filter: "none" explícito en lite — pisa el blur inicial que el SSR
      // deja inline (el servidor no conoce el tamaño de pantalla).
      style={lite ? { opacity, y, filter: "none" } : { opacity, y, filter }}
      className={cn(
        "relative inline-block",
        isKey ? "mx-[0.14em] px-[0.18em]" : "mr-[0.3em]",
      )}
    >
      {isKey ? (
        <>
          {/* Gemela invisible: conserva el espacio cuando la clave vuela */}
          <span className="invisible font-display font-extrabold not-italic tracking-tight">
            {word}
          </span>
          {!gathered && (
            <motion.span
              layoutId={`kw-${keyIndex}`}
              transition={{ type: "spring", stiffness: 210, damping: 26 }}
              className="absolute inset-0 mx-[-0.18em] px-[0.18em]"
            >
              <motion.span
                aria-hidden
                style={{ scaleX: highlight }}
                className="absolute inset-x-0 inset-y-[-0.04em] origin-left rounded-lg bg-gradient-to-r from-[#f472b6]/20 via-[#a78bfa]/20 to-[#22d3ee]/20 ring-1 ring-[#a78bfa]/40"
              />
              {/* Chispa que salta al seleccionarse */}
              <motion.span
                aria-hidden
                style={{ scale: highlight, opacity: highlight }}
                className="absolute -top-[0.55em] left-1/2 -translate-x-1/2 text-[0.45em] text-[#f472b6] drop-shadow-[0_0_7px_rgba(244,114,182,0.95)]"
              >
                ✦
              </motion.span>
              <span
                className={cn(
                  "relative font-display font-extrabold not-italic tracking-tight drop-shadow-[0_0_16px_rgba(167,139,250,0.45)]",
                  AURORA_TEXT,
                )}
              >
                {word}
              </span>
            </motion.span>
          )}
        </>
      ) : (
        word
      )}
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
  const lite = useLite();
  const [gathered, setGathered] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Con histéresis para que no parpadee en el umbral
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setGathered((g) => (g ? v > GATHER_AT - 0.03 : v > GATHER_AT));
  });

  const kickerOpacity = useTransform(scrollYProgress, [0.02, 0.08], [0, 1]);
  const readProgress = useTransform(scrollYProgress, [REVEAL_START, REVEAL_END], [0, 1]);
  const bigStarRotate = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const bigStarOpacity = useTransform(scrollYProgress, [0.05, 0.3], [0, 1]);

  const keywords = useMemo(
    () => words.filter(([, k]) => k === 1).map(([w]) => w),
    [words],
  );
  // Índice de clave por posición (−1 si no es clave)
  const keyIndexOf = useMemo(() => {
    const arr: number[] = [];
    let k = -1;
    for (const [, isKey] of words) {
      if (isKey === 1) k += 1;
      arr.push(isKey === 1 ? k : -1);
    }
    return arr;
  }, [words]);

  return (
    <section ref={ref} className="relative h-[220vh] bg-[#05070f] sm:h-[300vh]">
      {/* Fusión suave con el cielo navy del hero */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy to-transparent"
        aria-hidden
      />
      <div className="sticky top-0 flex h-screen items-center overflow-hidden pt-16">
        <NightSky />

        {/* Estrella gigante de fondo, rotando con el scroll (solo desktop) */}
        <motion.div
          style={{ rotate: bigStarRotate, opacity: bigStarOpacity }}
          className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block"
          aria-hidden
        >
          <svg width="620" height="620" viewBox="0 0 32 32" className="max-w-[90vw]">
            <path
              d="M16 1 L19 12.5 L31 16 L19 19.5 L16 31 L13 19.5 L1 16 L13 12.5 Z"
              fill="none"
              stroke="rgba(167,139,250,0.08)"
              strokeWidth="0.35"
            />
            <path
              d="M16 6 L18 13.8 L26 16 L18 18.2 L16 26 L14 18.2 L6 16 L14 13.8 Z"
              fill="none"
              stroke="rgba(244,114,182,0.06)"
              strokeWidth="0.3"
            />
          </svg>
        </motion.div>

        <LayoutGroup>
          <div className="container-ac relative py-16 text-center">
            {/* Kicker centrado con líneas y barra de lectura */}
            <motion.div style={{ opacity: kickerOpacity }} className="mx-auto max-w-md">
              <div className="flex items-center justify-center gap-4">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#a78bfa]/60" aria-hidden />
                <p className="kicker text-[#f472b6]">{kicker}</p>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#a78bfa]/60" aria-hidden />
              </div>
              <div className="mx-auto mt-3 h-[3px] w-36 overflow-hidden rounded-full bg-white/10">
                <motion.span
                  style={{ scaleX: readProgress }}
                  className="block h-full origin-left rounded-full bg-gradient-to-r from-[#f472b6] via-[#a78bfa] to-[#22d3ee] shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                />
              </div>
            </motion.div>

            {/* El relato: serif itálica editorial, centrado */}
            <p className="mx-auto mt-8 max-w-4xl text-center font-serif text-[1.45rem] italic leading-[1.6] text-white/90 sm:mt-10 sm:text-[2.2rem] sm:leading-[1.5]">
              {words.map(([w, isKey], i) => (
                <Word
                  key={`${i}-${w}`}
                  word={w}
                  isKey={isKey === 1}
                  keyIndex={keyIndexOf[i]}
                  index={i}
                  total={words.length}
                  progress={scrollYProgress}
                  lite={lite}
                  gathered={gathered}
                />
              ))}
            </p>

            {/* Las palabras clave vuelan aquí y forman el eslogan completo */}
            <div className="relative mx-auto mt-10 min-h-[6rem] max-w-3xl sm:mt-12">
              <motion.span
                aria-hidden
                animate={{ opacity: gathered ? 1 : 0 }}
                transition={{ duration: 0.6 }}
                className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a78bfa]/10 blur-3xl"
              />
              <motion.div
                aria-hidden
                animate={{ opacity: gathered ? 1 : 0 }}
                transition={{ duration: 0.5, delay: gathered ? 0.35 : 0 }}
                className="relative flex items-center gap-4"
              >
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#a78bfa]/60 to-[#f472b6]/70" />
                <svg width="20" height="20" viewBox="0 0 32 32" className="shrink-0">
                  <path
                    d="M16 2 L18.6 13.4 L30 16 L18.6 18.6 L16 30 L13.4 18.6 L2 16 L13.4 13.4 Z"
                    fill="#f472b6"
                    style={{ filter: "drop-shadow(0 0 8px rgba(244,114,182,0.95))" }}
                  />
                </svg>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#a78bfa]/60 to-[#22d3ee]/70" />
              </motion.div>

              <p
                className="mt-5 flex flex-wrap items-baseline justify-center gap-x-[0.3em] font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
                aria-label={gathered ? slogan : undefined}
              >
                {gathered &&
                  keywords.map((w, j) => (
                    <motion.span
                      key={`slogan-${j}`}
                      layoutId={`kw-${j}`}
                      transition={{
                        type: "spring",
                        stiffness: 190,
                        damping: 24,
                        delay: j * 0.06,
                      }}
                      className={cn(
                        "animate-aurora inline-block drop-shadow-[0_0_26px_rgba(167,139,250,0.55)]",
                        AURORA_TEXT,
                        j === 0 && "capitalize",
                      )}
                    >
                      {w}
                    </motion.span>
                  ))}
              </p>
            </div>
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
}
