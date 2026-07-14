"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { NightSky } from "@/components/Constellation";
import { StarGlyph } from "@/components/Star";
import { Icon } from "@/components/icons";
import type { PostDTO } from "./PostFeed";
import { OrbitCard } from "./OrbitCard";

// Desplazamiento del cielo por tarjeta: el viaje se siente, sin marear.
const SKY_SHIFT_PX = 36;

/**
 * Modo Órbita — el feed en el formato donde vive la atención de esta
 * generación: pantalla completa, una publicación a la vez, swipe vertical.
 * A propósito es FINITO (sin scroll infinito ni autoplay): cuando el
 * recorrido termina, la última tarjeta invita a publicar.
 */
export function OrbitFeed({ posts, loggedIn }: { posts: PostDTO[]; loggedIn: boolean }) {
  const { dict } = useI18n();
  const O = dict.community.orbit;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const total = posts.length + 1; // + la tarjeta final del recorrido

  // La página de fondo no debe desplazarse mientras la Órbita está abierta.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Tarjeta visible: alimenta el progreso, el viaje del cielo y el video.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(Number((e.target as HTMLElement).dataset.orbitIndex));
          }
        }
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll("[data-orbit-index]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [posts.length]);

  return (
    <div className="fixed inset-0 z-[70] bg-[#05070f] text-white">
      {/* El cielo viaja: cada swipe lo desplaza como un salto entre estrellas */}
      <motion.div
        className="absolute inset-x-0 top-[-30%] h-[170%]"
        animate={reduced ? undefined : { y: -(active * SKY_SHIFT_PX) }}
        transition={{ type: "spring", stiffness: 46, damping: 20 }}
        aria-hidden
      >
        <NightSky />
      </motion.div>

      {/* Barra superior: identidad + salida + progreso del recorrido */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-1.5 backdrop-blur-md">
            <StarGlyph size={17} className="text-gold" />
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.22em]">
              {O.title}
            </span>
          </span>
          <Link
            href="/comunidad/posts"
            aria-label={O.exit}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] backdrop-blur-md transition-colors hover:bg-white/15"
          >
            <Icon name="close" size={17} />
          </Link>
        </div>
        <div className="mx-4 h-[3px] overflow-hidden rounded-full bg-white/10 sm:mx-6">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-bright to-gold shadow-[0_0_8px_rgba(34,211,238,0.7)]"
            animate={{ width: `${((active + 1) / total) * 100}%` }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          />
        </div>
      </header>

      {/* El recorrido: una publicación por pantalla, snap nativo */}
      <div
        ref={scrollerRef}
        className="relative z-10 h-[100dvh] snap-y snap-mandatory overflow-y-auto overscroll-contain"
      >
        {posts.map((p, i) => (
          <section
            key={p.id}
            data-orbit-index={i}
            className="flex h-full snap-start items-center justify-center px-4 pb-12 pt-24 sm:px-8"
          >
            <OrbitCard post={p} loggedIn={loggedIn} active={active === i} />
          </section>
        ))}

        {/* Fin del recorrido: la invitación a encender la propia estrella */}
        <section
          data-orbit-index={posts.length}
          className="flex h-full snap-start items-center justify-center px-6 pb-12 pt-24"
        >
          <div className="max-w-md text-center">
            <motion.div
              animate={reduced ? undefined : { scale: [1, 1.12, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <StarGlyph
                size={64}
                className="mx-auto text-gold drop-shadow-[0_0_26px_rgba(251,191,36,0.6)]"
              />
            </motion.div>
            <h2 className="mt-6 font-display text-3xl font-bold text-white [text-wrap:balance]">
              {O.endTitle}
            </h2>
            <p className="mt-3 leading-relaxed text-[#aebad8]">{O.endBody}</p>
            <Link
              href="/comunidad/posts?publicar=1"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-cyan-bright px-6 py-3 font-semibold text-white shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Icon name="sparkles" size={18} />
              {O.endCta}
            </Link>
            <p className="mt-5 text-xs text-white/45">{O.endHint}</p>
          </div>
        </section>
      </div>

      {/* Pista de gesto en la primera tarjeta */}
      {active === 0 && posts.length > 0 && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center text-white/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          aria-hidden
        >
          <motion.span
            className="flex flex-col items-center gap-1"
            animate={reduced ? undefined : { y: [0, -7, 0] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon name="arrowRight" size={15} className="-rotate-90" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">
              {O.swipe}
            </span>
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
