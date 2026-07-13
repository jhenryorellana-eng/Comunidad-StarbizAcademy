"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/components/ui";

const SLIDES = [
  "/hero/hero-1.jpg",
  "/hero/hero-2.jpg",
  "/hero/hero-3.jpg",
  "/hero/hero-4.jpg",
];
const INTERVAL_MS = 5000;

/**
 * Holo-visor del hero: vitrina de vidrio estilo HUD que rota las imágenes de
 * la marca. En cada cambio, un haz de luz recorre el borde del marco, las
 * esquinas HUD parpadean y un barrido de luz cruza la imagen nueva.
 */
export function HeroShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // Inclinación 3D que sigue al cursor (con física de resorte)
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 220, damping: 24 });
  const springY = useSpring(tiltY, { stiffness: 220, damping: 24 });

  function onPointerMove(e: React.PointerEvent) {
    const el = frameRef.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tiltY.set(px * 10);
    tiltX.set(py * -10);
  }
  function resetTilt() {
    tiltX.set(0);
    tiltY.set(0);
  }

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="relative mx-auto w-full max-w-[380px] md:max-w-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        resetTilt();
      }}
      onPointerMove={onPointerMove}
    >
      {/* Retroiluminación LED ambiental */}
      <div className="absolute -inset-8" aria-hidden>
        <div className="animate-led absolute -left-4 top-6 h-44 w-44 rounded-full bg-cyan-bright/25 blur-3xl [animation-duration:4.5s]" />
        <div className="animate-led absolute -right-6 bottom-4 h-48 w-48 rounded-full bg-gold/20 blur-3xl [animation-duration:5.5s] [animation-delay:1.2s]" />
      </div>

      {/* Destello del marco al cambiar de imagen */}
      <motion.div
        key={`flash-${index}`}
        className="pointer-events-none absolute -inset-1 rounded-[34px]"
        initial={{ boxShadow: "0 0 0px 0px rgba(34,211,238,0)" }}
        animate={{
          boxShadow: [
            "0 0 0px 0px rgba(34,211,238,0)",
            "0 0 42px 6px rgba(34,211,238,0.5)",
            "0 0 18px 2px rgba(34,211,238,0.12)",
          ],
        }}
        transition={{ duration: 1.1, times: [0, 0.25, 1], ease: "easeOut" }}
        aria-hidden
      />

      {/* Chispa dorada orbitando el marco */}
      <div className="animate-orbit pointer-events-none absolute -inset-3" aria-hidden>
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_12px_3px_rgba(251,191,36,0.8)]" />
      </div>

      {/* Marco con inclinación 3D */}
      <motion.div
        ref={frameRef}
        style={{ rotateX: springX, rotateY: springY, transformPerspective: 900 }}
        className="relative"
      >
      {/* Anillo del marco: contiene los haces que recorren el borde */}
      <div className="relative overflow-hidden rounded-[30px] p-[2px] shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
        {/* Base tenue del borde */}
        <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-cyan-bright/30 via-white/10 to-gold/30" aria-hidden />
        {/* Haz ambiental: gira lento todo el tiempo */}
        <div
          className="animate-beam absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "conic-gradient(transparent 0deg, transparent 300deg, rgba(34,211,238,0.9) 330deg, rgba(255,255,255,0.9) 342deg, rgba(251,191,36,0.9) 354deg, transparent 360deg)",
          }}
          aria-hidden
        />
        {/* Haz de cambio: da una vuelta rápida completa en cada slide */}
        <motion.div
          key={`beam-${index}`}
          className="absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "conic-gradient(transparent 0deg, transparent 250deg, rgba(34,211,238,1) 300deg, rgba(255,255,255,1) 330deg, rgba(251,191,36,1) 350deg, transparent 360deg)",
          }}
          initial={{ rotate: 0, opacity: 1 }}
          animate={{ rotate: 360, opacity: [1, 1, 0] }}
          transition={{ duration: 1.1, ease: [0.32, 0.72, 0, 1], times: [0, 0.85, 1] }}
          aria-hidden
        />

        {/* Pantalla interior */}
        <div className="relative aspect-square overflow-hidden rounded-[28px] bg-navy">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            >
              <Image
                src={SLIDES[index]}
                alt="StarbizAcademy"
                fill
                sizes="(min-width: 768px) 420px, 90vw"
                priority={index === 0}
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Barrido de luz sobre la imagen nueva */}
          <motion.div
            key={`sheen-${index}`}
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-150%", skewX: -18 }}
            animate={{ x: "420%", skewX: -18 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
            aria-hidden
          />

          {/* Esquinas HUD que parpadean al cambiar */}
          <motion.div
            key={`hud-${index}`}
            className="pointer-events-none absolute inset-3"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: [0.9, 0.25, 0.65] }}
            transition={{ duration: 1.4, times: [0, 0.5, 1] }}
            aria-hidden
          >
            {(["left-0 top-0 border-l-2 border-t-2 rounded-tl-lg", "right-0 top-0 border-r-2 border-t-2 rounded-tr-lg", "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-lg", "right-0 bottom-0 border-r-2 border-b-2 rounded-br-lg"] as const).map(
              (pos) => (
                <span
                  key={pos}
                  className={cn(
                    "absolute h-5 w-5 border-cyan-bright/90 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]",
                    pos,
                  )}
                />
              ),
            )}
          </motion.div>

          {/* Consola inferior: LEDs de progreso */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent pb-3.5 pt-8">
            <div className="flex items-center justify-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Imagen ${i + 1}`}
                  className={cn(
                    "relative h-1.5 overflow-hidden rounded-full transition-all duration-300",
                    i === index ? "w-10 bg-white/20" : "w-4 bg-white/15 hover:bg-white/30",
                  )}
                >
                  {i === index && (
                    <motion.span
                      key={`progress-${index}-${paused}`}
                      className="absolute inset-y-0 left-0 rounded-full bg-cyan-bright shadow-[0_0_8px_rgba(34,211,238,0.9)]"
                      initial={{ width: "0%" }}
                      animate={{ width: paused ? "100%" : ["0%", "100%"] }}
                      transition={
                        paused
                          ? { duration: 0.3 }
                          : { duration: INTERVAL_MS / 1000, ease: "linear" }
                      }
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
}
