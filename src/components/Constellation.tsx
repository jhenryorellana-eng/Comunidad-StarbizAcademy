"use client";

import { motion } from "motion/react";
import { EASE } from "./motion";

/*
 * The GÉNESIS i7 constellation — the brand's methodology drawn as a night sky.
 * Seven named stars rise from left to right and end on the brand's gold star.
 * Coordinates are fixed (no randomness at render time → no hydration issues).
 */

// Ambient twinkling stars: [x%, y%, size(px), delay(s), duration(s)]
const AMBIENT: Array<[number, number, number, number, number]> = [
  [4, 18, 2, 0.2, 3.2], [9, 62, 1.5, 1.1, 4.1], [14, 34, 2, 2.3, 3.6],
  [21, 78, 1.5, 0.7, 4.4], [26, 12, 2.5, 1.8, 3.1], [31, 51, 1.5, 0.4, 3.9],
  [38, 26, 2, 2.9, 4.2], [43, 84, 1.5, 1.4, 3.4], [49, 8, 2, 0.9, 4.6],
  [54, 44, 1.5, 2.1, 3.3], [60, 70, 2, 0.1, 4.0], [66, 22, 1.5, 1.6, 3.7],
  [71, 58, 2.5, 2.6, 3.0], [77, 15, 1.5, 0.6, 4.3], [82, 76, 2, 1.9, 3.5],
  [88, 38, 1.5, 2.8, 4.5], [93, 60, 2, 1.2, 3.8], [97, 24, 1.5, 0.3, 4.1],
  [17, 90, 1.5, 2.4, 3.2], [63, 92, 1.5, 0.8, 4.2], [35, 66, 1.5, 1.5, 3.9],
  [86, 5, 2, 2.2, 3.4], [7, 45, 1.5, 1.0, 4.0], [58, 30, 1.5, 2.7, 3.6],
  [12, 8, 1.5, 3.1, 4.8], [24, 40, 2, 0.5, 3.7], [33, 5, 1.5, 1.9, 4.4],
  [41, 55, 2, 2.5, 3.2], [47, 30, 1.5, 0.8, 4.9], [52, 72, 2, 3.4, 3.5],
  [57, 14, 1.5, 1.3, 4.1], [64, 48, 2, 2.0, 3.8], [69, 84, 1.5, 0.4, 4.6],
  [74, 33, 2, 2.8, 3.3], [79, 62, 1.5, 1.6, 4.2], [84, 20, 2, 3.0, 3.6],
  [91, 80, 1.5, 0.9, 4.4], [95, 45, 2, 2.2, 3.9], [3, 75, 1.5, 1.4, 4.7],
  [19, 25, 1.5, 2.6, 3.4], [28, 88, 2, 0.6, 4.3], [45, 68, 1.5, 3.2, 3.7],
];

// Static dust stars (tiny, cheap — depth layer): [x%, y%]
const DUST: Array<[number, number]> = [
  [2, 30], [6, 8], [11, 50], [13, 72], [16, 15], [20, 58], [23, 33], [27, 70],
  [30, 22], [34, 45], [37, 80], [40, 10], [44, 38], [48, 60], [51, 18], [55, 88],
  [59, 52], [62, 5], [67, 36], [70, 74], [73, 12], [76, 48], [80, 90], [83, 28],
  [87, 55], [90, 14], [94, 70], [96, 35], [99, 55], [5, 92], [50, 42], [65, 65],
];

// Bright "hero" stars with a glow halo: [x%, y%, delay(s)]
const BRIGHT: Array<[number, number, number]> = [
  [15, 22, 0.5], [46, 16, 2.1], [72, 42, 1.2], [90, 10, 3.0], [28, 62, 2.6],
];

// Comets: [x%, y%, angle(deg), delay(s), period(s), tail(px), color, glow]
const COMETS: Array<[number, number, number, number, number, number, string, string]> = [
  [2, 8, 22, 0, 11, 170, "rgba(255,255,255,0.95)", "rgba(34,211,238,0.85)"],
  [48, 2, 30, 4.2, 14, 210, "rgba(251,191,36,0.95)", "rgba(251,191,36,0.8)"],
  [22, 18, 17, 8.1, 12, 140, "rgba(167,139,250,0.95)", "rgba(167,139,250,0.8)"],
  [65, 6, 26, 2.3, 16, 120, "rgba(248,113,113,0.9)", "rgba(248,113,113,0.75)"],
  [10, 40, 12, 11.5, 17, 190, "rgba(34,211,238,0.95)", "rgba(255,255,255,0.85)"],
];

// Four-point sparkles: [x%, y%, size(px), delay(s), period(s), color]
const SPARKLES: Array<[number, number, number, number, number, string]> = [
  [22, 14, 10, 0.4, 4.2, "rgba(255,255,255,0.95)"],
  [61, 26, 8, 1.8, 5.1, "rgba(34,211,238,0.95)"],
  [83, 64, 11, 3.0, 4.6, "rgba(251,191,36,0.95)"],
  [38, 74, 8, 2.2, 5.4, "rgba(255,255,255,0.9)"],
  [8, 55, 9, 0.9, 4.9, "rgba(167,139,250,0.95)"],
  [93, 30, 8, 3.6, 4.4, "rgba(255,255,255,0.9)"],
  [52, 48, 7, 1.2, 5.8, "rgba(34,211,238,0.9)"],
];

// Halo stars whose glow breathes: [x%, y%, size(px), delay(s), color]
const HALOS: Array<[number, number, number, number, string]> = [
  [31, 30, 3, 0.6, "rgba(34,211,238,0.9)"],
  [76, 18, 3.5, 2.4, "rgba(255,255,255,0.9)"],
  [56, 82, 3, 1.5, "rgba(251,191,36,0.9)"],
  [12, 78, 2.5, 3.2, "rgba(167,139,250,0.9)"],
];

/** Full-bleed twinkling star layer. Place inside a `relative` navy section. */
export function NightSky() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Polvo estelar (capa de profundidad) */}
      {DUST.map(([x, y], i) => (
        <span
          key={`dust-${i}`}
          className="absolute h-px w-px rounded-full bg-white/40"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
      {AMBIENT.map(([x, y, s, d, t], i) => (
        <span
          key={i}
          className="star-twinkle absolute rounded-full bg-white"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: s,
            height: s,
            animationDelay: `${d}s`,
            animationDuration: `${t}s`,
          }}
        />
      ))}
      {/* Estrellas brillantes con halo */}
      {BRIGHT.map(([x, y, d], i) => (
        <span
          key={`bright-${i}`}
          className="star-twinkle absolute h-[3px] w-[3px] rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.7)]"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s`, animationDuration: "5s" }}
        />
      ))}
      {/* Destellos de 4 puntas que giran al titilar */}
      {SPARKLES.map(([x, y, s, d, t, c], i) => (
        <span
          key={`sparkle-${i}`}
          className="star-sparkle"
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              width: s,
              height: s,
              "--sp-color": c,
              "--sp-delay": `${d}s`,
              "--sp-period": `${t}s`,
            } as React.CSSProperties
          }
        />
      ))}
      {/* Estrellas cuyo halo respira */}
      {HALOS.map(([x, y, s, d, c], i) => (
        <span
          key={`halo-${i}`}
          className="star-halo"
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              width: s,
              height: s,
              "--halo-color": c,
              "--halo-delay": `${d}s`,
            } as React.CSSProperties
          }
        />
      ))}
      {/* Cometas multicolor que iluminan el cielo al pasar */}
      {COMETS.map(([x, y, angle, delay, period, tail, color, glow], i) => (
        <span
          key={`comet-${i}`}
          className="comet"
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              "--comet-angle": `${angle}deg`,
              "--comet-delay": `${delay}s`,
              "--comet-period": `${period}s`,
              "--comet-len": `${tail}px`,
              "--comet-color": color,
              "--comet-glow": glow,
            } as React.CSSProperties
          }
        />
      ))}
      {/* LED accent stars in the brand colors, with a soft halo */}
      {([
        [12, 26, "#22d3ee"], [46, 72, "#fbbf24"], [69, 12, "#22d3ee"],
        [91, 48, "#fbbf24"], [28, 55, "#f87171"],
      ] as Array<[number, number, string]>).map(([x, y, c], i) => (
        <span
          key={`led-${i}`}
          className="animate-led absolute rounded-full"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: 3,
            height: 3,
            background: c,
            boxShadow: `0 0 8px 1.5px ${c}`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}
      {/* Atmosphere: soft cyan glow low-left, gold glow high-right */}
      <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-cyan-bright/10 blur-3xl" />
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
    </div>
  );
}

// The 7 intelligence nodes, ascending toward the gold star (viewBox 1200x180).
const NODES: Array<[number, number]> = [
  [70, 132], [240, 104], [410, 116], [580, 80], [750, 92], [920, 52], [1105, 24],
];

// Journey colors: from spiritual cyan to the technological gold star.
const NODE_COLORS = [
  "#22d3ee", "#3ed2e2", "#63d0cd", "#93ceac", "#c2c884", "#e8c250", "#fbbf24",
];

const VB_W = 1200;
const VB_H = 180;
const PATH_D = `M${NODES.map(([x, y]) => `${x} ${y}`).join(" L")}`;

/**
 * La constelacion GENESIS i7: linea de luz con gradiente y glow que se dibuja
 * sola, un pulso de energia que viaja de i1 a i7 cargando la estrella dorada,
 * y nodos interactivos con chips de vidrio. `labels` llega localizado.
 */
export function Constellation({
  labels,
  weekWord = "Semana",
}: {
  labels: string[];
  weekWord?: string;
}) {
  return (
    <div className="relative" role="img" aria-label={labels.join(" · ")}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} fill="none" className="block w-full overflow-visible">
        <defs>
          <linearGradient id="genesis-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <filter id="genesis-glow" x="-30%" y="-200%" width="160%" height="500%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Halo difuso de la linea */}
        <motion.path
          d={PATH_D}
          stroke="url(#genesis-line)"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.35"
          filter="url(#genesis-glow)"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: EASE, delay: 0.3 }}
        />
        {/* Nucleo nitido de la linea */}
        <motion.path
          d={PATH_D}
          stroke="url(#genesis-line)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: EASE, delay: 0.3 }}
        />

        {/* Pulso de energia que recorre la constelacion (i1 -> i7) */}
        <circle r="5" fill="#ffffff" opacity="0.95">
          <animateMotion dur="6s" repeatCount="indefinite" path={PATH_D} />
        </circle>
        <circle r="10" fill="#22d3ee" opacity="0.28">
          <animateMotion dur="6s" repeatCount="indefinite" path={PATH_D} />
        </circle>
        <circle r="3" fill="#22d3ee" opacity="0.8">
          <animateMotion dur="6s" begin="-0.18s" repeatCount="indefinite" path={PATH_D} />
        </circle>
      </svg>

      {/* Nodos interactivos (HTML sobre el SVG) */}
      <div className="pointer-events-none absolute inset-0">
        {NODES.map(([x, y], i) => {
          const last = i === NODES.length - 1;
          const color = NODE_COLORS[i];
          return (
            <motion.div
              key={i}
              className="group pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-default"
              style={{ left: `${(x / VB_W) * 100}%`, top: `${(y / VB_H) * 100}%` }}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.4 + i * 0.16 }}
            >
              {/* Tooltip superior: Semana N */}
              <span
                className="pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:-translate-y-1 group-hover:opacity-100"
                aria-hidden
              >
                {weekWord} {i + 1}
              </span>

              {/* Estrella del nodo */}
              {last ? (
                <span className="relative flex h-10 w-10 items-center justify-center transition-transform duration-300 group-hover:scale-125">
                  <span
                    className="animate-led absolute inset-0 rounded-full [animation-duration:3s]"
                    style={{ background: "radial-gradient(closest-side, rgba(251,191,36,0.5), transparent)" }}
                  />
                  <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
                    <path
                      d="M16 2 L18.6 13.4 L30 16 L18.6 18.6 L16 30 L13.4 18.6 L2 16 L13.4 13.4 Z"
                      fill="#fbbf24"
                      style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.9))" }}
                    />
                  </svg>
                </span>
              ) : (
                <span className="relative flex h-8 w-8 items-center justify-center transition-transform duration-300 group-hover:scale-125">
                  <span
                    className="animate-led absolute inset-1 rounded-full"
                    style={{
                      background: `radial-gradient(closest-side, ${color}55, transparent)`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                  <span
                    className="relative h-2.5 w-2.5 rounded-full"
                    style={{ background: color, boxShadow: `0 0 10px 2px ${color}` }}
                  />
                </span>
              )}

              {/* Chip de vidrio con la inteligencia */}
              <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 text-center">
                <span className="hidden whitespace-nowrap rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/[0.14] group-hover:text-white sm:inline-flex sm:items-center sm:gap-1.5">
                  <b style={{ color }}>i{i + 1}</b>
                  {labels[i] ?? ""}
                </span>
                {/* En movil: solo el numero */}
                <span className="text-[0.65rem] font-bold sm:hidden" style={{ color }}>
                  i{i + 1}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
