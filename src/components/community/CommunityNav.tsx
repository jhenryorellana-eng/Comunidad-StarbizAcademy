"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { COMMUNITY_SPACES } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/components/ui";

/** Desktop-only vertical sidebar (mobile uses CommunityBottomNav). */
export function CommunityNav({ isMember }: { isMember: boolean }) {
  const { dict } = useI18n();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/community" ? pathname === "/community" : pathname.startsWith(href);

  const spaceLabel = (key: string) =>
    dict.community.spaces[key as keyof typeof dict.community.spaces];

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-20 flex flex-col gap-1">
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
        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-navy text-white" : "text-ink hover:bg-navy/[0.05] hover:text-navy",
      )}
    >
      <Icon name={icon} size={18} />
      <span>{label}</span>
      {locked && <Icon name="lock" size={13} className="ml-auto opacity-60" />}
    </Link>
  );
}
