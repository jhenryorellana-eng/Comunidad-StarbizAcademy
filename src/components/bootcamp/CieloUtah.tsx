"use client";

import { cn } from "@/components/ui";

/**
 * El cielo de Utah, atado al avance del formulario.
 *
 * EL SOL SE PONE MIENTRAS SE RELLENA. Al llegar es hora dorada; al pagar, el
 * cielo está lleno de estrellas — que es exactamente la imagen de la marca.
 *
 * VA ATADO AL PASO, NO A UN RELOJ. Con un temporizador de cuarenta segundos,
 * quien se levante a buscar el pasaporte de su hijo vuelve a una noche cerrada
 * sin haber rellenado nada, y quien vaya rápido no ve el efecto. Atado al
 * avance, el cielo siempre dice la verdad sobre dónde está.
 *
 * SÓLO SE ANIMAN OPACIDAD Y TRANSFORM. Las cuatro luces son capas fijas que se
 * funden; animar el propio degradado obligaría a repintar el cielo entero en
 * cada fotograma, que es justo lo que hacía ir lento el móvil antes.
 *
 * LA BANDA SE ENCOGE DESPUÉS DEL PRIMER PASO. En una pantalla de 844 px, 300
 * de cielo son un tercio gastado antes del primer campo. En el paso 1 todavía
 * hay que convencer; a partir del 2, el formulario manda.
 */

/** Las cuatro luces del recorrido. Ninguna pasa por el azul. */
const LUCES = [
  "linear-gradient(180deg, #9a8fb5 0%, #d69a86 30%, #f0b06a 62%, #fadfae 100%)",
  "linear-gradient(180deg, #6a5a8f 0%, #b5628a 28%, #e08a3c 58%, #f6c579 100%)",
  "linear-gradient(180deg, #33245a 0%, #6b3060 30%, #b5453f 60%, #e0803c 100%)",
  "linear-gradient(180deg, #120d26 0%, #241a3d 38%, #3d2450 68%, #5c3352 100%)",
];

/** Cuánto ha bajado el sol en cada paso, en píxeles. */
const CAIDA = [0, 46, 118, 178];
const DERIVA = [0, 12, 24, 34];

/**
 * `desde` es el paso en el que la estrella aparece: salen a medida que cae la
 * luz, no todas de golpe. `soloAmplio` retira la mitad por debajo de sm — cada
 * elemento en pantalla mantiene ocupado al compositor, y en un teléfono de gama
 * media eso se nota en la fluidez de todo lo demás.
 */
const ESTRELLAS: Array<{ x: number; y: number; t: number; desde: number; soloAmplio?: boolean }> = [
  { x: 10, y: 16, t: 2, desde: 2 },
  { x: 27, y: 30, t: 1.5, desde: 3 },
  { x: 46, y: 12, t: 2.5, desde: 3 },
  { x: 63, y: 34, t: 1.5, desde: 3 },
  { x: 82, y: 20, t: 2, desde: 3 },
  { x: 38, y: 9, t: 1.5, desde: 2 },
  { x: 7, y: 40, t: 2, desde: 4 },
  { x: 19, y: 8, t: 1.5, desde: 4, soloAmplio: true },
  { x: 33, y: 45, t: 2, desde: 4, soloAmplio: true },
  { x: 55, y: 24, t: 1.5, desde: 4 },
  { x: 70, y: 46, t: 2, desde: 4, soloAmplio: true },
  { x: 88, y: 38, t: 1.5, desde: 4 },
  { x: 94, y: 14, t: 2, desde: 4, soloAmplio: true },
  { x: 51, y: 52, t: 1.5, desde: 4, soloAmplio: true },
];

export function CieloUtah({
  paso,
  children,
}: {
  /** 1–4. Cualquier valor mayor se trata como el final del recorrido. */
  paso: number;
  children: React.ReactNode;
}) {
  const i = Math.min(Math.max(paso, 1), 4) - 1;

  return (
    <div
      className={cn(
        "relative overflow-hidden transition-[height] duration-700 ease-out",
        paso === 1 ? "h-[220px] sm:h-[300px]" : "h-[168px] sm:h-[212px]",
      )}
    >
      {LUCES.map((luz, n) => (
        <span
          key={n}
          aria-hidden
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ backgroundImage: luz, opacity: n === i ? 1 : 0 }}
        />
      ))}

      {ESTRELLAS.map((e, n) => (
        <span
          key={n}
          aria-hidden
          className={cn(
            "absolute rounded-full bg-white transition-opacity duration-[1200ms] ease-in-out",
            e.soloAmplio && "hidden sm:block",
            // Al final ya no quedan pasos que dar: el cielo puede respirar.
            paso >= 4 && "star-twinkle",
          )}
          style={{
            left: `${e.x}%`,
            top: `${e.y}%`,
            width: e.t,
            height: e.t,
            opacity: paso >= e.desde ? 1 : 0,
            animationDelay: `${(n % 5) * 0.7}s`,
          }}
        />
      ))}

      {/* El rescoldo de donde se puso, ya sin sol a la vista. */}
      <span
        aria-hidden
        className="absolute bottom-[28%] right-[6%] h-[62px] w-[150px] rounded-full transition-opacity duration-[1200ms] sm:h-[80px] sm:w-[240px]"
        style={{
          background: "radial-gradient(closest-side, rgba(255,205,130,0.5), transparent 74%)",
          opacity: paso === 3 ? 1 : 0,
        }}
      />

      {/* El sol va ANTES de las montañas en el orden del documento: así lo
          ocultan de verdad al bajar, en vez de apagarse por opacidad. */}
      <span
        aria-hidden
        className="absolute right-[13%] top-[16%] h-[62px] w-[62px] rounded-full transition-transform duration-[1200ms] ease-in-out sm:h-[78px] sm:w-[78px]"
        style={{
          background:
            "radial-gradient(closest-side, #fff6d8, #fbcf6a 58%, rgba(251,191,36,0.18) 80%, transparent 92%)",
          transform: `translate(${DERIVA[i]}px, ${CAIDA[i]}px)`,
        }}
      />

      {/* Wasatch. En móvil van ocho picos: catorce a 390 px de ancho no son
          montañas, son ruido. */}
      <svg
        viewBox="0 0 390 76"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 block h-[76px] w-full sm:hidden"
        aria-hidden
      >
        <path
          d="M0 76 L0 44 L58 18 L104 40 L164 10 L232 38 L292 20 L342 44 L390 26 L390 76 Z"
          fill="#2a1832"
          opacity="0.93"
        />
        <path d="M0 76 L0 60 L74 46 L152 62 L232 48 L318 64 L390 52 L390 76 Z" fill="#180f20" />
      </svg>
      <svg
        viewBox="0 0 860 112"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 hidden h-[112px] w-full sm:block"
        aria-hidden
      >
        <path
          d="M0 112 L0 64 L74 30 L132 60 L198 16 L268 56 L340 24 L402 62 L470 34 L544 68 L610 40 L684 72 L744 46 L810 70 L860 44 L860 112 Z"
          fill="#2a1832"
          opacity="0.93"
        />
        <path
          d="M0 112 L0 88 L88 68 L166 92 L246 72 L330 94 L414 76 L500 96 L588 78 L676 98 L764 82 L860 100 L860 112 Z"
          fill="#180f20"
        />
      </svg>

      <div className="container-ac relative h-full">{children}</div>
    </div>
  );
}
