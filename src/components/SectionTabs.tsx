"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { PLATFORM_SECTIONS } from "@/lib/constants";
import { cn } from "@/components/ui";

/**
 * Top-level section switcher — Comunidad · Padres · StarbizAcademy.
 * Sticky under the header on every section, desktop and mobile.
 */
export function SectionTabs() {
  const { dict } = useI18n();
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-30 border-b border-black/[0.05] bg-surface/80 backdrop-blur-xl">
      <div className="container-ac">
        {/* pr móvil: deja libre la esquina del botón de espacios de la comunidad */}
        <nav className="flex gap-1 overflow-x-auto py-2 pr-24 lg:pr-0" aria-label="Secciones">
          {PLATFORM_SECTIONS.map((s) => {
            const active = pathname.startsWith(s.base);
            const soon = s.key !== "comunidad";
            return (
              <Link
                key={s.key}
                href={s.href}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-navy text-white shadow-[0_4px_16px_rgba(26,39,68,0.3)]"
                    : "text-muted hover:bg-navy/[0.05] hover:text-navy",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="section-led"
                    className="absolute inset-x-4 -bottom-2 h-[3px] rounded-full bg-cyan-bright shadow-[0_0_8px_2px_rgba(34,211,238,0.7)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    aria-hidden
                  />
                )}
                {dict.sections[s.key]}
                {soon && !active && (
                  <span className="rounded-full bg-gold/15 px-1.5 py-px text-[0.6rem] font-bold uppercase tracking-wide text-gold-700">
                    {dict.sections.soonBadge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
