import { Icon, type IconName } from "@/components/icons";
import { BannerLogo } from "./BannerLogo";
import { NightSky } from "@/components/Constellation";
import { getDict } from "@/lib/i18n/server";

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

/* Paleta real del arte del logo (nebulosa magenta/violeta sobre índigo) y del
   brand system oficial: bruma magenta #CF116D y violeta #523FFF. */
const NEBULA_MAGENTA = "rgba(207,17,109,0.55)";
const NEBULA_VIOLET = "rgba(82,63,255,0.45)";

// Cometas del banner: [left%, top%, ángulo, delay s, período s, largo px, color, estela]
// Un ÚNICO cometa. Con la nebulosa del logo ya hay actividad de sobra; dos
// cometas convertían la portada en una feria.
const BANNER_COMETS: Array<[number, number, number, number, number, number, string, string]> = [
  [6, 14, 19, 1.6, 11, 160, "rgba(255,255,255,0.95)", "rgba(34,211,238,0.8)"],
];

/**
 * Portada de la comunidad.
 *
 * Composición: cielo navy, HORIZONTE PLANETARIO al pie y el arte del logo como
 * núcleo de luz. Se quitaron las esquinas HUD (encajonaban la escena: un cielo
 * no tiene esquinas), el segundo cometa y el subrayado de constelación, que a
 * ese tamaño se leía como un gráfico de bolsa en vez de como GÉNESIS i7.
 *
 * La entrada es CSS puro y escalonada —luz, horizonte, mensaje— así que ocurre
 * en el primer pintado, sin esperar a que hidrate React.
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
      {/* Brumas de nebulosa lejanas: repiten la paleta del logo en la otra
          punta de la portada para que la escena se lea como una sola. */}
      <div
        className="parallax-near pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full blur-[70px]"
        style={{ background: `radial-gradient(circle, ${NEBULA_MAGENTA}, transparent 70%)` }}
        aria-hidden
      />
      <div
        className="parallax-near pointer-events-none absolute -bottom-20 right-1/4 h-48 w-64 rounded-full blur-[70px]"
        style={{ background: `radial-gradient(circle, ${NEBULA_VIOLET}, transparent 72%)` }}
        aria-hidden
      />
      {/* Las estrellas se mueven menos que las brumas: esa diferencia de
          recorrido al hacer scroll es lo que se percibe como profundidad. */}
      <div className="parallax-far pointer-events-none absolute inset-0" aria-hidden>
        <NightSky />
      </div>
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

      {/* HORIZONTE PLANETARIO — el elemento que más cambia la pieza: le da
          suelo, curvatura y escala. Sin él la portada era una caja con
          estrellas; con él es un LUGAR, visto desde la órbita. */}
      <span
        className="animate-horizon pointer-events-none absolute left-1/2 top-[82%] h-[130%] w-[190%] rounded-[50%]"
        style={{
          animationDelay: "260ms",
          background: "linear-gradient(180deg, rgba(12,32,56,0.92) 0%, #060a18 42%)",
          border: "1px solid rgba(34,211,238,0.45)",
          boxShadow:
            "0 -16px 55px -8px rgba(34,211,238,0.32), inset 0 28px 70px -34px rgba(34,211,238,0.45)",
        }}
        aria-hidden
      />
      {/* Atmósfera justo sobre la línea del horizonte */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
        style={{
          background:
            "linear-gradient(0deg, rgba(34,211,238,0.16) 0%, rgba(34,211,238,0.05) 45%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* El nombre vive UNA vez: dentro del arte del logo. El texto es el mensaje. */}
      {/* En escritorio la portada es apaisada: el logo se agranda, el bloque
          respira más y el conjunto se asienta a la izquierda para que el cielo
          y el cometa tengan sitio propio a la derecha en vez de quedar como
          relleno detrás del texto. */}
      <div className="relative flex aspect-[16/9] flex-col items-center justify-center gap-5 px-6 text-center text-white sm:aspect-[3/1] sm:flex-row sm:justify-start sm:gap-10 sm:px-10 sm:text-left xl:gap-14 xl:px-14">
        {/* El logo y su nebulosa. Todo cuelga de este contenedor, así que la
            nebulosa sigue al logo tanto en columna (móvil) como en fila. */}
        <BannerLogo />

        <div className="flex flex-col items-center sm:items-start">
          <p
            className="animate-rise font-display text-[1.95rem] font-extrabold leading-[1.08] text-white [text-wrap:balance] sm:text-5xl"
            style={{ animationDelay: "540ms" }}
          >
            {label ?? dict.community.taglineMain}
          </p>
          {!label && (
            <p
              className="animate-rise mt-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/45"
              style={{ animationDelay: "700ms" }}
            >
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
