"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { COMMUNITY_SPACES } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/components/ui";

// iOS-like easing: decelerate on enter.
const EASE = [0.32, 0.72, 0, 1] as const;

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

  const isActive = (href: string) =>
    href === "/community" ? pathname === "/community" : pathname.startsWith(href);
  const label = (key: string) =>
    dict.community.spaces[key as keyof typeof dict.community.spaces];

  const current =
    [...COMMUNITY_SPACES].reverse().find((s) => isActive(s.href)) ?? COMMUNITY_SPACES[0];

  return (
    <div className="lg:hidden">
      {/* Frosted top bar — the whole left cluster opens the menu */}
      <div className="sticky top-16 z-30 border-b border-black/[0.06] bg-surface/70 backdrop-blur-xl">
        <div className="container-ac flex h-12 items-center">
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="-ml-1 flex items-center gap-2.5 rounded-full px-1 py-1 text-navy"
            aria-label={dict.nav.community}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/[0.06]">
              <Icon name="menu" size={18} />
            </span>
            <span className="flex items-center gap-1">
              <Icon name={current.icon as IconName} size={16} className="text-cyan" />
              <span className="font-display text-[0.95rem] font-semibold tracking-tight">
                {label(current.key)}
              </span>
            </span>
          </motion.button>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <motion.div
              className="absolute inset-0 bg-navy/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col bg-paper/95 backdrop-blur-xl shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.5, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) setOpen(false);
              }}
            >
              <div className="flex items-center justify-between px-5 pb-2 pt-5">
                <span className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dict.nav.community}
                </span>
                <motion.button
                  type="button"
                  onClick={() => setOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted"
                >
                  <Icon name="close" size={18} />
                </motion.button>
              </div>

              <motion.nav
                className="flex-1 overflow-y-auto px-3 pb-8"
                initial="hidden"
                animate="show"
                variants={{
                  show: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } },
                }}
              >
                {COMMUNITY_SPACES.map((s) => {
                  const active = isActive(s.href);
                  const locked = s.gated && !isMember;
                  return (
                    <motion.div
                      key={s.key}
                      variants={{
                        hidden: { opacity: 0, x: -16 },
                        show: { opacity: 1, x: 0, transition: { ease: EASE, duration: 0.35 } },
                      }}
                    >
                      <Link
                        href={s.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "mb-0.5 flex items-center gap-3.5 rounded-2xl px-3.5 py-3 text-[0.95rem] transition-colors active:scale-[0.98]",
                          active
                            ? "bg-navy font-semibold text-white"
                            : "font-medium text-ink active:bg-navy/[0.04]",
                        )}
                      >
                        <Icon
                          name={s.icon as IconName}
                          size={20}
                          className={active ? "text-white" : "text-navy/70"}
                        />
                        <span>{label(s.key)}</span>
                        {locked && (
                          <Icon
                            name="lock"
                            size={13}
                            className={cn("ml-auto", active ? "opacity-70" : "opacity-50")}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
