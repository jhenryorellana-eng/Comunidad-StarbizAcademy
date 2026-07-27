import { getCurrentUser } from "@/lib/auth";
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
  // El diccionario ya no hace falta aquí: con la fila de enlaces fuera, el
  // header no tiene ni un texto propio.
  const user = await getCurrentUser();
  return (
    <>
      {/* Cinta del bootcamp: va FUERA del header sticky a propósito, para no
          alterar su altura (las pestañas de sección dependen de `top-16`). */}
      <BootcampRibbon />
      {/* Mismo motivo que en SectionTabs: dos barras sticky con desenfoque
          apiladas sobre el banner animado obligaban a rehacer el desenfoque en
          cada fotograma. Opaca en móvil, cristal desde `lg`. */}
      <header className="scroll-lift sticky top-0 z-40 border-b border-line bg-cream lg:bg-cream/85 lg:backdrop-blur">
        <div className="container-ac flex h-16 items-center justify-between gap-2 sm:gap-4">
          <Logo />
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
