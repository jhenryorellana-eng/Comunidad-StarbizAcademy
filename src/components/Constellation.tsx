"use client";

import { motion } from "motion/react";
import { EASE } from "./motion";

/*
 * The GÉNESIS i7 constellation — the brand's methodology drawn as a night sky.
 * Seven named stars rise from left to right and end on the brand's gold star.
 * Coordinates are fixed (no randomness at render time → no hydration issues).
 */

// Ambient background stars: [x%, y%, size(px), delay(s), duration(s)]
const AMBIENT: Array<[number, number, number, number, number]> = [
  [4, 18, 2, 0.2, 3.2], [9, 62, 1.5, 1.1, 4.1], [14, 34, 2, 2.3, 3.6],
  [21, 78, 1.5, 0.7, 4.4], [26, 12, 2.5, 1.8, 3.1], [31, 51, 1.5, 0.4, 3.9],
  [38, 26, 2, 2.9, 4.2], [43, 84, 1.5, 1.4, 3.4], [49, 8, 2, 0.9, 4.6],
  [54, 44, 1.5, 2.1, 3.3], [60, 70, 2, 0.1, 4.0], [66, 22, 1.5, 1.6, 3.7],
  [71, 58, 2.5, 2.6, 3.0], [77, 15, 1.5, 0.6, 4.3], [82, 76, 2, 1.9, 3.5],
  [88, 38, 1.5, 2.8, 4.5], [93, 60, 2, 1.2, 3.8], [97, 24, 1.5, 0.3, 4.1],
  [17, 90, 1.5, 2.4, 3.2], [63, 92, 1.5, 0.8, 4.2], [35, 66, 1.5, 1.5, 3.9],
  [86, 5, 2, 2.2, 3.4], [7, 45, 1.5, 1.0, 4.0], [58, 30, 1.5, 2.7, 3.6],
];

/** Full-bleed twinkling star layer. Place inside a `relative` navy section. */
export function NightSky() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
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
