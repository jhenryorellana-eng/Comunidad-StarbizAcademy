import Image from "next/image";
import { Icon, type IconName } from "@/components/icons";
import { StarDivider } from "@/components/Star";
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
 * Portada de la comunidad: la identidad en grande sobre el cielo nocturno de
 * la marca — logo real, wordmark y la constelación GÉNESIS i7 como horizonte.
 */
export async function SpaceBanner({ label }: { label?: string }) {
  const { dict } = await getDict();
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl ring-1 ring-navy/20">
      {/* Cielo profundo con atmósfera propia */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0a1226] via-navy to-[#0b3a4d]"
        aria-hidden
      />
      <NightSky />
      {/* Halo dorado tras el logo */}
      <div
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl"
        aria-hidden
      />

      <div className="relative flex aspect-[16/9] flex-col items-center justify-center px-6 pb-6 text-center text-white sm:aspect-[3/1]">
        <Image
          src="/logo.png"
          alt=""
          width={64}
          height={64}
          className="h-14 w-14 rounded-2xl ring-2 ring-white/20 shadow-[0_0_34px_rgba(251,191,36,0.35)] sm:h-16 sm:w-16"
        />
        {label ? (
          <p className="mt-3.5 font-display text-base font-bold uppercase tracking-[0.2em] sm:text-xl">
            {label}
          </p>
        ) : (
          <p className="mt-3.5 whitespace-nowrap font-display text-lg uppercase tracking-[0.2em] sm:text-2xl">
            <span className="font-extrabold">Starbiz</span>{" "}
            <span className="font-light">Academy</span>
          </p>
        )}
        <p className="mt-1.5 text-xs font-medium tracking-wide text-[#aebad8] [text-wrap:balance] sm:text-sm">
          {dict.community.tagline}
        </p>
      </div>

      {/* La constelación como horizonte del banner */}
      <StarDivider
        variant="navy"
        className="absolute inset-x-0 bottom-0 h-9 opacity-70 sm:h-12"
      />
    </div>
  );
}
