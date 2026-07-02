import { Icon, type IconName } from "@/components/icons";
import { StarGlyph } from "@/components/Star";

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
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan">
        <Icon name={icon} size={22} />
      </span>
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold text-navy sm:text-2xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Branded gradient banner shown at the top of community spaces. */
export function SpaceBanner({ label }: { label?: string }) {
  return (
    <div className="relative mb-6 flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy-700 to-cyan sm:h-36">
      <div className="flex flex-col items-center text-white">
        <StarGlyph size={46} className="text-white/90" />
        <p className="mt-2 font-display text-sm font-bold uppercase tracking-[0.25em]">
          {label ?? "StarbizAcademy"}
        </p>
      </div>
    </div>
  );
}
