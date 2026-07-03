"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { COMMUNITY_SPACES } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/components/ui";

/** Desktop-only vertical sidebar (mobile uses CommunityMobileNav). */
export function CommunityNav({ isMember }: { isMember: boolean }) {
  const { dict } = useI18n();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/community" ? pathname === "/community" : pathname.startsWith(href);

  const spaceLabel = (key: string) =>
    dict.community.spaces[key as keyof typeof dict.community.spaces];

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-20 flex flex-col gap-1 rounded-2xl border border-surface-line bg-paper p-2 shadow-sm">
        {COMMUNITY_SPACES.slice(0, 1).map((s) => (
          <NavItem
            key={s.key}
            href={s.href}
            icon={s.icon as IconName}
            label={spaceLabel(s.key)}
            active={isActive(s.href)}
          />
        ))}

        <p className="px-3 pb-1 pt-4 font-display text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
          {dict.nav.community}
        </p>

        {COMMUNITY_SPACES.slice(1).map((s) => (
          <NavItem
            key={s.key}
            href={s.href}
            icon={s.icon as IconName}
            label={spaceLabel(s.key)}
            active={isActive(s.href)}
            locked={s.gated && !isMember}
          />
        ))}
      </nav>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  locked,
}: {
  href: string;
  icon: IconName;
  label: string;
  active: boolean;
  locked?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-navy text-white shadow-[0_4px_18px_rgba(26,39,68,0.28)]"
          : "text-ink hover:translate-x-0.5 hover:bg-navy/[0.05] hover:text-navy",
      )}
    >
      {/* Sliding LED indicator — glides between active items */}
      {active && (
        <motion.span
          layoutId="community-nav-led"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-cyan-bright shadow-[0_0_10px_2px_rgba(34,211,238,0.75)]"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          aria-hidden
        />
      )}
      <Icon
        name={icon}
        size={18}
        className={cn(
          "transition-colors duration-200",
          active ? "text-cyan-bright" : "text-navy/55 group-hover:text-cyan",
        )}
      />
      <span>{label}</span>
      {locked && <Icon name="lock" size={13} className="ml-auto opacity-60" />}
    </Link>
  );
}
