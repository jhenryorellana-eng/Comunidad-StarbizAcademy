import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { Logo } from "./Star";
import { LocaleToggle } from "./LocaleToggle";
import { AuthControls } from "./AuthControls";
import { MobileMenu } from "./MobileMenu";

export async function SiteHeader() {
  const [user, { dict }] = await Promise.all([getCurrentUser(), getDict()]);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur">
      <div className="container-ac flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-navy md:flex">
          <Link href="/community" className="transition-colors hover:text-cyan">
            {dict.nav.community}
          </Link>
          <Link href="/#genesis" className="transition-colors hover:text-cyan">
            {dict.nav.genesis}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <MobileMenu />
          <LocaleToggle />
          <AuthControls user={user ? { name: user.name, role: user.role } : null} />
        </div>
      </div>
    </header>
  );
}
