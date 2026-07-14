"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { COMMUNITY_SPACES } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/components/ui";

/**
 * Navegación móvil de la comunidad: botón de menú en la esquina superior
 * IZQUIERDA (antes de "Comunidad"). Al presionarlo se abre desde esa esquina
 * una pestaña vertical con todas las secciones.
 */
export function CommunityMobileNav({ isMember }: { isMember: boolean }) {
  const { dict } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Al navegar, la pestaña se cierra sola.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  return (
    <div className="lg:hidden">
      {/* Botón de menú: esquina superior izquierda, antes de Comunidad */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={dict.community.spacesLabel}
        aria-expanded={open}
        className="fixed left-3 top-[4.45rem] z-40 flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white shadow-[0_5px_20px_rgba(26,39,68,0.35)] transition-transform active:scale-95"
      >
        <Icon name="menu" size={19} />
        <span
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-bright shadow-[0_0_6px_2px_rgba(34,211,238,0.7)]"
          aria-hidden
        />
      </button>

      {/* La pestaña vertical que se abre desde la esquina izquierda */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <motion.div
              className="absolute inset-0 bg-navy/35 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute left-3 top-[4.45rem] w-[min(76vw,290px)] overflow-hidden rounded-2xl border border-white/50 bg-paper/95 shadow-2xl backdrop-blur-xl"
              initial={{ clipPath: "inset(0 100% 100% 0 round 16px)", opacity: 0.5 }}
              animate={{ clipPath: "inset(0 0% 0% 0 round 16px)", opacity: 1 }}
              exit={{ clipPath: "inset(0 100% 100% 0 round 16px)", opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="flex items-center justify-between px-4 pb-1 pt-3.5">
                <span className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {dict.community.spacesLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={dict.common.close}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted active:bg-navy/[0.06]"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>

              {/* Todas las secciones, en vertical */}
              <motion.nav
                className="flex flex-col gap-1 px-3 pb-3.5 pt-1"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } } }}
              >
                {COMMUNITY_SPACES.map((s) => {
                  const active = isActive(s.href);
                  const locked = s.gated && !isMember;
                  return (
                    <motion.div
                      key={s.key}
                      variants={{
                        hidden: { opacity: 0, x: -16 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
                      }}
                    >
                      <Link
                        href={s.href}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-medium transition-colors active:scale-[0.98]",
                          active ? "bg-navy text-white" : "text-ink hover:bg-navy/[0.05]",
                          locked && !active && "opacity-60",
                        )}
                      >
                        {active && (
                          <span
                            className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-cyan-bright shadow-[0_0_8px_2px_rgba(34,211,238,0.7)]"
                            aria-hidden
                          />
                        )}
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            active ? "bg-white/10 text-cyan-bright" : "bg-cyan-50 text-cyan",
                          )}
                        >
                          <Icon name={s.icon as IconName} size={17} />
                        </span>
                        <span>{label(s.key)}</span>
                        {locked && (
                          <Icon name="lock" size={13} className="ml-auto opacity-60" />
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
