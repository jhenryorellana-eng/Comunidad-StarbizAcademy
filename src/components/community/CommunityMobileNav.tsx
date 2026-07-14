"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { COMMUNITY_SPACES } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";
import { StarGlyph } from "@/components/Star";
import { cn } from "@/components/ui";

/**
 * Navegación móvil de la comunidad: un botón en la esquina superior derecha
 * que despliega los espacios en HORIZONTAL — una franja de vidrio que se
 * revela desde la esquina, con los chips entrando en cascada.
 */
export function CommunityMobileNav({ isMember }: { isMember: boolean }) {
  const { dict } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname.startsWith(href);
  const label = (key: string) =>
    dict.community.spaces[key as keyof typeof dict.community.spaces];
  const current = COMMUNITY_SPACES.find((s) => isActive(s.href));

  return (
    <div className="lg:hidden">
      {/* Botón esquina superior: muestra el espacio actual */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={dict.community.spacesLabel}
        aria-expanded={open}
        className="fixed right-3 top-[4.55rem] z-40 flex h-9 items-center gap-1.5 rounded-full border border-navy/15 bg-navy pl-3 pr-3.5 text-white shadow-[0_4px_18px_rgba(26,39,68,0.35)] transition-transform active:scale-95"
      >
        <StarGlyph size={15} className="text-gold" />
        <span className="text-xs font-semibold">
          {current ? label(current.key) : dict.community.spacesLabel}
        </span>
        <span
          className="ml-0.5 h-1.5 w-1.5 rounded-full bg-cyan-bright shadow-[0_0_6px_2px_rgba(34,211,238,0.7)]"
          aria-hidden
        />
      </button>

      {/* Despliegue horizontal desde la esquina */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <motion.div
              className="absolute inset-0 bg-navy/45 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute inset-x-3 top-[4.1rem] overflow-hidden rounded-3xl border border-white/40 bg-paper/95 shadow-2xl backdrop-blur-xl"
              initial={{ clipPath: "inset(0 0 100% 92% round 24px)", opacity: 0.6 }}
              animate={{ clipPath: "inset(0 0 0% 0% round 24px)", opacity: 1 }}
              exit={{ clipPath: "inset(0 0 100% 92% round 24px)", opacity: 0 }}
              transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="flex items-center justify-between px-5 pb-1 pt-4">
                <span className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dict.community.spacesLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={dict.common.close}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted active:bg-navy/[0.06]"
                >
                  <Icon name="close" size={17} />
                </button>
              </div>

              {/* Los espacios, en una franja horizontal deslizable */}
              <motion.nav
                className="flex gap-2 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none]"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.035 } } }}
              >
                {COMMUNITY_SPACES.map((s) => {
                  const active = isActive(s.href);
                  const locked = s.gated && !isMember;
                  return (
                    <motion.div
                      key={s.key}
                      variants={{
                        hidden: { opacity: 0, x: 26 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                      }}
                      className="shrink-0"
                    >
                      <Link
                        href={s.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "relative flex w-[4.6rem] flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition-colors active:scale-[0.97]",
                          active
                            ? "border-navy bg-navy text-white"
                            : "border-surface-line bg-paper text-ink",
                          locked && !active && "opacity-60",
                        )}
                      >
                        <Icon
                          name={s.icon as IconName}
                          size={20}
                          className={active ? "text-cyan-bright" : "text-navy/60"}
                        />
                        <span className="text-[0.68rem] font-semibold leading-none">
                          {label(s.key)}
                        </span>
                        {locked && (
                          <Icon
                            name="lock"
                            size={11}
                            className="absolute right-1.5 top-1.5 opacity-60"
                          />
                        )}
                        {active && (
                          <span
                            className="absolute inset-x-4 bottom-1 h-[2.5px] rounded-full bg-cyan-bright shadow-[0_0_8px_2px_rgba(34,211,238,0.7)]"
                            aria-hidden
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
