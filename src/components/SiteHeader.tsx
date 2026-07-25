import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { Logo } from "./Star";
import { LocaleToggle } from "./LocaleToggle";
import { AuthControls } from "./AuthControls";
import { MobileMenu } from "./MobileMenu";
import { BootcampRibbon } from "./bootcamp/BootcampRibbon";

export async function SiteHeader({
  mobileMenu = true,
}: {
  /** Hide the marketing hamburger where another nav exists (community hub). */
  mobileMenu?: boolean;
}) {
  const [user, { dict }] = await Promise.all([getCurrentUser(), getDict()]);
  return (
    <>
      {/* Cinta del bootcamp: va FUERA del header sticky a propósito, para no
          alterar su altura (las pestañas de sección dependen de `top-16`). */}
      <BootcampRibbon />
      <header className="scroll-lift sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur">
        <div className="container-ac flex h-16 items-center justify-between gap-2 sm:gap-4">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-navy md:flex">
            <Link href="/comunidad" className="transition-colors hover:text-cyan">
              {dict.nav.community}
            </Link>
            <Link
              href="/bootcamp"
              className="inline-flex items-center gap-1.5 font-semibold text-navy transition-colors hover:text-cyan"
            >
              <span
                className="animate-led h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_2px_rgba(251,191,36,0.7)]"
                aria-hidden
              />
              {dict.nav.bootcamp}
            </Link>
            <Link href="/padres" className="transition-colors hover:text-cyan">
              {dict.nav.padres}
            </Link>
            <Link href="/academia" className="transition-colors hover:text-cyan">
              {dict.nav.academy}
            </Link>
            <Link href="/comunidad/tienda" className="transition-colors hover:text-cyan">
              {dict.nav.store}
            </Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {mobileMenu && <MobileMenu />}
            <LocaleToggle />
            <AuthControls user={user ? { name: user.name, role: user.role } : null} />
          </div>
        </div>
      </header>
    </>
  );
}
