"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { COMMUNITY_SPACES, MOBILE_BAR_KEYS } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/components/ui";

/**
 * Mobile-first navigation (PDF spec): a fixed bottom bar with 4 items —
 * Posts · Miembros · Eventos · Más. The rest of the spaces live in the
 * "Más" bottom sheet.
 */
export function CommunityMobileNav({ isMember }: { isMember: boolean }) {
  const { dict } = useI18n();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const isActive = (href: string) => pathname.startsWith(href);
  const label = (key: string) =>
    dict.community.spaces[key as keyof typeof dict.community.spaces];

  const barSpaces = MOBILE_BAR_KEYS.map(
    (k) => COMMUNITY_SPACES.find((s) => s.key === k)!,
  );
  const sheetSpaces = COMMUNITY_SPACES.filter(
    (s) => !(MOBILE_BAR_KEYS as readonly string[]).includes(s.key),
  );
  const sheetActive = sheetSpaces.some((s) => isActive(s.href));

  return (
    <div className="lg:hidden">
      {/* Bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.06] bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-md grid-cols-4">
          {barSpaces.map((s) => (
            <BarItem
              key={s.key}
              href={s.href}
              icon={s.icon as IconName}
              label={label(s.key)}
              active={isActive(s.href)}
            />
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 text-[0.68rem] font-medium transition-colors",
              sheetActive || moreOpen ? "text-navy" : "text-muted",
            )}
          >
            {(sheetActive || moreOpen) && <BarLed />}
            <Icon
              name="menu"
              size={20}
              className={sheetActive || moreOpen ? "text-cyan" : ""}
            />
            {dict.common.more}
          </button>
        </div>
      </nav>

      {/* "Más" bottom sheet */}
      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
            <motion.div
              className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/40 bg-paper/95 pb-[max(env(safe-area-inset-bottom),1rem)] shadow-2xl backdrop-blur-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 60) setMoreOpen(false);
              }}
            >
              <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-navy/15" aria-hidden />
              <div className="flex items-center justify-between px-6 pb-1 pt-4">
                <span className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dict.common.more}
                </span>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  aria-label={dict.common.close}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted"
                >
                  <Icon name="close" size={17} />
                </button>
              </div>
              <motion.nav
                className="grid grid-cols-2 gap-2 px-4 pb-4 pt-2"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.04 } } }}
              >
                {sheetSpaces.map((s) => {
                  const active = isActive(s.href);
                  const locked = s.gated && !isMember;
                  return (
                    <motion.div
                      key={s.key}
                      variants={{
                        hidden: { opacity: 0, y: 14 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                      }}
                    >
                      <Link
                        href={s.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-[0.95rem] font-medium transition-colors active:scale-[0.98]",
                          active
                            ? "border-navy bg-navy text-white"
                            : "border-surface-line bg-paper text-ink",
                          locked && !active && "opacity-60",
                        )}
                      >
                        <Icon
                          name={s.icon as IconName}
                          size={19}
                          className={active ? "text-cyan-bright" : "text-navy/60"}
                        />
                        <span>{label(s.key)}</span>
                        {locked && <Icon name="lock" size={13} className="ml-auto opacity-60" />}
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

function BarItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: IconName;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 text-[0.68rem] font-medium transition-colors",
        active ? "text-navy" : "text-muted",
      )}
    >
      {active && <BarLed />}
      <Icon name={icon} size={20} className={active ? "text-cyan" : ""} />
      {label}
    </Link>
  );
}

/** LED strip above the active bottom-bar item, glides between tabs. */
function BarLed() {
  return (
    <motion.span
      layoutId="mobile-bar-led"
      className="absolute inset-x-4 top-0 h-[3px] rounded-full bg-cyan-bright shadow-[0_0_8px_2px_rgba(34,211,238,0.7)]"
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      aria-hidden
    />
  );
}
