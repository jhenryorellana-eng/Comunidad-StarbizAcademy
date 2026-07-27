import { getSpaceCounts } from "@/lib/communityData";
import { getCurrentUser, isMember } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { CommunityNav } from "@/components/community/CommunityNav";
import { CommunityRail } from "@/components/community/CommunityRail";
import { CommunityNavProvider } from "@/components/community/navContext";
import { CommunityNavLauncher } from "@/components/community/CommunityNavLauncher";
import { CommunityNavDrawer } from "@/components/community/CommunityNavDrawer";
import { CommunityGuide } from "@/components/community/CommunityGuide";
import { PodcastPlayerProvider } from "@/components/community/PodcastPlayer";
import { SectionTabs } from "@/components/SectionTabs";

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const member = isMember(user?.role);

  // Contadores de la barra lateral, cacheados 60 s (ver lib/communityData):
  // son cinco viajes a Supabase y a 518 ms cada uno no pueden repetirse en
  // cada navegación.
  const counts = await getSpaceCounts();

  return (
    // El proveedor envuelve barra y panel: el botón vive DENTRO de la barra de
    // secciones (para seguirla siempre) y el panel fuera (la barra tiene
    // backdrop-blur, que atraparía a un hijo `position: fixed`).
    <CommunityNavProvider isMember={member}>
      <div data-seccion="comunidad" className="relative flex min-h-screen flex-col bg-surface">
        {/* AMBIENTE. En pantallas anchas sobran ~540px a cada lado del
            contenido; en gris plano eso se lee como página sin terminar. Tres
            manchas de marca muy tenues los convierten en atmósfera. Fijo, así
            que no se mueve con el scroll ni cuesta repintado. */}
        <div className="pointer-events-none fixed inset-0 -z-10 hidden lg:block" aria-hidden>
          <div className="absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(65%_100%_at_50%_0%,rgba(8,145,178,0.08),transparent_72%)]" />
          <div className="absolute -left-52 top-[28%] h-[560px] w-[560px] rounded-full bg-cyan/[0.06] blur-[130px]" />
          <div className="absolute -right-52 top-[62%] h-[600px] w-[600px] rounded-full bg-gold/[0.06] blur-[130px]" />
        </div>
        <SiteHeader mobileMenu={false} />
        <SectionTabs leading={<CommunityNavLauncher />} />
        <PodcastPlayerProvider>
          <CommunityNavDrawer />
          {/* Guía de bienvenida. Se muestra una vez —recuerda en localStorage—
              y se puede reabrir desde Inicio. Vive en el layout para que dé
              igual por qué espacio de la comunidad se entre. */}
          <CommunityGuide />
          {/* Contenedor propio, más ancho que el del resto del sitio: aquí
              caben tres columnas y en pantallas grandes el de 76rem dejaba
              media pantalla vacía. */}
          <div className="mx-auto flex w-full max-w-[76rem] flex-1 gap-6 px-6 pb-10 pt-4 xl:max-w-[92rem] lg:py-6">
            <CommunityNav isMember={member} counts={counts} />
            <main className="min-w-0 flex-1">{children}</main>
            <CommunityRail />
          </div>
        </PodcastPlayerProvider>
      </div>
    </CommunityNavProvider>
  );
}
