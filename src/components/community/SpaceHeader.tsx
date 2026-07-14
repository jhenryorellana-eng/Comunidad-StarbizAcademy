import Image from "next/image";
import { Icon, type IconName } from "@/components/icons";
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

/**
 * Portada de la comunidad en modo "Cosmic Core" del Brand System Operativo:
 * el arte original del logo (fuente de verdad de la marca) sobre el cosmos
 * con bruma de nebulosa, y el gradiente "orbit" como línea de horizonte.
 * Tokens usados (tokens/starbiz.css): cosmic-950 #020618 · cosmic-800 #0E0920
 * · nebula-deep #1F0853 · nebula-bright #CF116D · violet #523FFF · orbit
 * (#14C6FF→#523FFF→#F87000→#FFBF00) · planet-aqua #17EED8.
 */
export async function SpaceBanner({ label }: { label?: string }) {
  const { dict } = await getDict();
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl ring-1 ring-white/10">
      {/* Cosmos: de espacio profundo a nebulosa */}
      <div
        className="absolute inset-0 bg-[linear-gradient(135deg,#020618_0%,#0E0920_45%,#1F0853_78%,#3d0a47_100%)]"
        aria-hidden
      />
      {/* Bruma de nebulosa (rosa arriba-derecha, violeta abajo-izquierda) */}
      <div
        className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#CF116D]/25 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-24 -left-14 h-64 w-64 rounded-full bg-[#523FFF]/25 blur-3xl"
        aria-hidden
      />
      <NightSky />

      <div className="relative flex aspect-[16/9] flex-col items-center justify-center gap-4 px-6 text-center text-white sm:aspect-[3/1] sm:flex-row sm:gap-7 sm:text-left">
        {/* El arte original del logo, como pieza central */}
        <Image
          src="/brand/starbiz-logo.png"
          alt="Starbiz Academy"
          width={128}
          height={128}
          className="h-24 w-24 shrink-0 rounded-2xl shadow-[0_0_44px_rgba(82,63,255,0.45)] ring-1 ring-white/20 sm:h-32 sm:w-32"
        />
        <div className="flex flex-col items-center sm:items-start">
          {label ? (
            <p className="font-display text-xl font-bold uppercase tracking-[0.14em] sm:text-3xl">
              {label}
            </p>
          ) : (
            <p className="whitespace-nowrap font-display text-2xl uppercase tracking-[0.14em] sm:text-4xl">
              <span className="font-extrabold">Starbiz</span>{" "}
              <span className="font-light">Academy</span>
            </p>
          )}
          {/* Subrayado "orbit": cyan → violeta → naranja → ámbar */}
          <span
            className="mt-2 h-[3px] w-24 rounded-full bg-[linear-gradient(100deg,#14C6FF_0%,#523FFF_48%,#F87000_78%,#FFBF00_100%)] sm:w-36"
            aria-hidden
          />
          <p className="mt-2.5 text-xs font-medium tracking-wide text-[#BEB7FF] [text-wrap:balance] sm:text-sm">
            {dict.community.tagline}
          </p>
        </div>
      </div>

      {/* Horizonte orbit al pie del banner */}
      <span
        className="absolute inset-x-0 bottom-0 h-[3px] bg-[linear-gradient(100deg,#14C6FF_0%,#523FFF_48%,#F87000_78%,#FFBF00_100%)] opacity-80"
        aria-hidden
      />
    </div>
  );
}
