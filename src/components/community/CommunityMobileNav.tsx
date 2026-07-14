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
 * Navegación móvil de la comunidad: un botón de menú en la esquina superior
 * derecha. Al presionarlo, el botón se ESTIRA en horizontal y las secciones
 * aparecen en línea; se toca una y navega. Sin paneles ni hojas.
 */
export function CommunityMobileNav({ isMember }: { isMember: boolean }) {
  const { dict } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Al navegar, el menú vuelve a ser botón.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname.startsWith(href);
  const label = (key: string) =>
    dict.community.spaces[key as keyof typeof dict.community.spaces];

  return (
    <div className="lg:hidden">
      {/* Cierra al tocar fuera (sin oscurecer la página) */}
      {open && (
        <button
          type="button"
          aria-label={dict.common.close}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 cursor-default"
          tabIndex={-1}
        />
      )}

      {/* El botón que se estira en horizontal */}
      <motion.div
        className="fixed right-3 top-[4.5rem] z-40 flex items-center overflow-hidden rounded-full border border-navy/15 bg-paper/95 shadow-[0_6px_24px_rgba(26,39,68,0.25)] backdrop-blur-xl"
        animate={{
          width: open ? "calc(100vw - 1.5rem)" : 44,
          height: open ? 62 : 44,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Las secciones, en línea horizontal */}
        <AnimatePresence>
          {open && (
            <motion.nav
              className="flex flex-1 items-center gap-1 overflow-x-auto py-1.5 pl-2 pr-1 [scrollbar-width:none]"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{ show: { transition: { staggerChildren: 0.03 } } }}
              aria-label={dict.community.spacesLabel}
            >
              {COMMUNITY_SPACES.map((s) => {
                const active = isActive(s.href);
                const locked = s.gated && !isMember;
                return (
                  <motion.div
                    key={s.key}
                    variants={{
                      hidden: { opacity: 0, x: 18 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
                    }}
                    className="shrink-0"
                  >
                    <Link
                      href={s.href}
                      className={cn(
                        "relative flex w-[3.4rem] flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition-colors active:scale-95",
                        active ? "bg-navy text-white" : "text-navy/75",
                        locked && !active && "opacity-55",
                      )}
                    >
                      <Icon
                        name={s.icon as IconName}
                        size={19}
                        className={active ? "text-cyan-bright" : ""}
                      />
                      <span className="text-[0.58rem] font-semibold leading-none">
                        {label(s.key)}
                      </span>
                      {active && (
                        <span
                          className="absolute inset-x-3 bottom-0.5 h-[2px] rounded-full bg-cyan-bright shadow-[0_0_6px_1.5px_rgba(34,211,238,0.7)]"
                          aria-hidden
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* El disparador vive en el extremo derecho del pill */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={dict.community.spacesLabel}
          aria-expanded={open}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
            open ? "text-navy" : "bg-navy text-white",
          )}
        >
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="flex"
          >
            <Icon name={open ? "close" : "menu"} size={19} />
          </motion.span>
          {!open && (
            <span
              className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-cyan-bright shadow-[0_0_6px_2px_rgba(34,211,238,0.7)]"
              aria-hidden
            />
          )}
        </button>
      </motion.div>
    </div>
  );
}
