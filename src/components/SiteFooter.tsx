import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { BRAND } from "@/lib/constants";
import { Logo, StarDivider } from "./Star";

export async function SiteFooter() {
  const { dict } = await getDict();
  const col = (title: string, links: Array<[string, string]>) => (
    <div>
      <h4 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-white/55">
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-white/75">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="transition-colors hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="mt-24 bg-navy text-white">
      <StarDivider variant="navy" className="h-16 -mb-px" />
      <div className="container-ac grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm text-white/65">
            {dict.landing.lead}
          </p>
          <p className="mt-4 text-xs uppercase tracking-wider text-white/40">
            Est. {BRAND.est} · {BRAND.base}
          </p>
        </div>
        {col(dict.nav.community, [
          [dict.community.spaces.feed, "/community"],
          [dict.community.spaces.events, "/community/events"],
          [dict.community.spaces.podcast, "/community/podcast"],
          [dict.community.spaces.chapters, "/community/chapters"],
        ])}
        {col("StarbizAcademy", [
          [dict.community.spaces.observatory, "/community/observatory"],
          [dict.community.spaces.members, "/community/members"],
          [dict.nav.genesis, "/#genesis"],
        ])}
        {col("Cuenta", [
          [dict.common.login, "/login"],
          [dict.common.join, "/signup"],
        ])}
      </div>
      <div className="border-t border-white/10">
        <div className="container-ac flex flex-col items-start justify-between gap-2 py-5 text-xs text-white/45 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} StarbizAcademy.</span>
          <span>CEO Junior · Padres 3.0 · GÉNESIS i7™</span>
        </div>
      </div>
    </footer>
  );
}
