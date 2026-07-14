import Image from "next/image";
import { Icon, type IconName } from "@/components/icons";
import { NightSky } from "@/components/Constellation";
import { getDict } from "@/lib/i18n/server";
import { cn } from "@/components/ui";

export function SpaceHeader({
  icon,
  title,
  subtitle,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan ring-1 ring-cyan/25 shadow-[0_0_16px_rgba(8,145,178,0.2)]">
        <Icon name={icon} size={22} />
      </span>
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold text-navy sm:text-2xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

// Esquinas HUD del visor del logo (mismo lenguaje que el hero de la landing).
const HUD_CORNERS = [
  "left-0 top-0 rounded-tl-lg border-l-2 border-t-2",
  "right-0 top-0 rounded-tr-lg border-r-2 border-t-2",
  "left-0 bottom-0 rounded-bl-lg border-b-2 border-l-2",
  "right-0 bottom-0 rounded-br-lg border-b-2 border-r-2",
] as const;

// Cometas del banner: [left%, top%, ángulo, delay s, período s, largo px, color, estela]
const BANNER_COMETS: Array<[number, number, number, number, number, number, string, string]> = [
  [6, 16, 21, 1.2, 9, 150, "rgba(255,255,255,0.95)", "rgba(34,211,238,0.8)"],
  [52, 4, 26, 5.4, 13, 190, "rgba(251,191,36,0.95)", "rgba(251,191,36,0.75)"],
];

/** La constelación GÉNESIS i7 como subrayado: 7 nodos hacia la estrella. */
function ConstellationUnderline() {
  const nodes: Array<[number, number]> = [
    [4, 22], [26, 17], [48, 20], [70, 12], [92, 15], [114, 7], [138, 9],
  ];
  return (
    <svg viewBox="0 0 150 26" className="mt-2 h-5 w-36 sm:w-40" aria-hidden>
      <polyline
        points={nodes.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke="rgba(34,211,238,0.65)"
        strokeWidth="1.3"
      />
      {nodes.slice(0, -1).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 1.7 : 2.3} fill="#22d3ee" opacity="0.9" />
      ))}
      <path
        d="M138 1 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4 Z"
        fill="#fbbf24"
      />
    </svg>
  );
}

/**
 * Portada de la comunidad: el universo visual de la plataforma (cielo navy,
 * visor HUD del hero, LEDs cyan/dorado) con el arte real del logo dentro del
 * visor y la constelación GÉNESIS i7 como firma bajo el mensaje.
 */
export async function SpaceBanner({ label }: { label?: string }) {
  const { dict } = await getDict();
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl shadow-[0_18px_50px_rgba(26,39,68,0.28)] ring-1 ring-navy/25">
      {/* El mismo cielo del hero: navy profundo hacia el azul del amanecer */}
      <div
        className="absolute inset-0 bg-[linear-gradient(140deg,#0a1020_0%,#1a2744_58%,#0e3a4f_100%)]"
        aria-hidden
      />
      <NightSky />
      {/* Cometas cruzando la portada */}
      {BANNER_COMETS.map(([x, y, angle, delay, period, len, color, glow], i) => (
        <span
          key={i}
          className={i > 0 ? "comet max-sm:hidden" : "comet"}
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              "--comet-angle": `${angle}deg`,
              "--comet-delay": `${delay}s`,
              "--comet-period": `${period}s`,
              "--comet-len": `${len}px`,
              "--comet-color": color,
              "--comet-glow": glow,
            } as React.CSSProperties
          }
          aria-hidden
        />
      ))}

      {/* El nombre vive UNA vez: dentro del arte del logo. El texto es el mensaje. */}
      <div className="relative flex aspect-[16/9] flex-col items-center justify-center gap-5 px-6 text-center text-white sm:aspect-[3/1] sm:flex-row sm:gap-9 sm:text-left">
        {/* Visor HUD con el arte original */}
        <div className="relative shrink-0">
          <div className="animate-led absolute -inset-3 rounded-[22px] bg-cyan-bright/10 blur-xl" aria-hidden />
          <Image
            src="/brand/starbiz-logo.png"
            alt="Starbiz Academy"
            width={144}
            height={144}
            className="relative h-28 w-28 rounded-2xl shadow-[0_10px_36px_rgba(0,0,0,0.45)] ring-1 ring-white/20 sm:h-36 sm:w-36"
          />
          <div className="pointer-events-none absolute -inset-2" aria-hidden>
            {HUD_CORNERS.map((pos) => (
              <span
                key={pos}
                className={cn(
                  "absolute h-4 w-4 border-cyan-bright/90 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]",
                  pos,
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-start">
          <p className="font-display text-[1.65rem] font-extrabold leading-tight text-white [text-wrap:balance] sm:text-4xl">
            {label ?? dict.community.taglineMain}
          </p>
          <ConstellationUnderline />
          {!label && (
            <p className="mt-1.5 text-sm font-medium tracking-wide text-[#aebad8]">
              {dict.community.taglineSub}
            </p>
          )}
        </div>
      </div>

      {/* LED de base: cyan → dorado, los colores de la plataforma */}
      <span
        className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-cyan-bright via-cyan to-gold opacity-90"
        aria-hidden
      />
    </div>
  );
}
