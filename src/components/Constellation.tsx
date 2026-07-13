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

// Comets: [x%, y%, angle(deg), delay(s), period(s)]
const COMETS: Array<[number, number, number, number, number]> = [
  [2, 8, 22, 0, 11],
  [48, 2, 30, 4.2, 13],
  [22, 18, 17, 8.1, 12],
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
      {/* Cometas cruzando el cielo */}
      {COMETS.map(([x, y, angle, delay, period], i) => (
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

// The 7 intelligence nodes, ascending toward the gold star.
const NODES: Array<[number, number]> = [
  [70, 132], [240, 104], [410, 116], [580, 80], [750, 92], [920, 52], [1105, 24],
];

/**
 * The GÉNESIS i7 constellation: a line that draws itself through 7 named
 * stars. `labels` come localized from the server (one per intelligence).
 */
export function Constellation({ labels }: { labels: string[] }) {
  const points = NODES.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg
      viewBox="0 0 1200 180"
      className="block w-full"
      role="img"
      aria-label={labels.join(" · ")}
    >
      <motion.polyline
        points={points}
        fill="none"
        stroke="rgba(34,211,238,0.5)"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: EASE, delay: 0.3 }}
      />
      {NODES.map(([x, y], i) => {
        const last = i === NODES.length - 1;
        return (
          <motion.g
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.35 + i * 0.18 }}
          >
            {last ? (
              // The brand's gold star closes the constellation.
              <g className="animate-pulse [animation-duration:3s]">
                <path
                  d={`M${x} ${y - 16} L${x + 4.5} ${y - 4.5} L${x + 16} ${y} L${x + 4.5} ${y + 4.5} L${x} ${y + 16} L${x - 4.5} ${y + 4.5} L${x - 16} ${y} L${x - 4.5} ${y - 4.5} Z`}
                  fill="#fbbf24"
                />
                <circle cx={x} cy={y} r="24" fill="#fbbf24" opacity="0.15" />
              </g>
            ) : (
              <>
                <circle cx={x} cy={y} r="4" fill="#22d3ee" />
                <circle cx={x} cy={y} r="9" fill="#22d3ee" opacity="0.2" />
              </>
            )}
            <g className="hidden md:block">
              <text
                x={x}
                y={y + 34}
                textAnchor="middle"
                fill={last ? "rgba(251,191,36,0.9)" : "rgba(255,255,255,0.55)"}
                fontSize="13"
                fontWeight={last ? 700 : 500}
                letterSpacing="0.08em"
              >
                {`i${i + 1} · ${labels[i] ?? ""}`}
              </text>
            </g>
          </motion.g>
        );
      })}
    </svg>
  );
}
