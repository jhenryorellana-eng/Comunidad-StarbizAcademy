import { getDict } from "@/lib/i18n/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTabs } from "@/components/SectionTabs";
import { SectionComingSoon } from "@/components/SectionComingSoon";

// Sección "StarbizAcademy" — tendrá sus propios espacios, como la Comunidad.
export default async function AcademySection() {
  const { dict } = await getDict();
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader mobileMenu={false} />
      <SectionTabs />
      <SectionComingSoon
        title={dict.nav.academy}
        tag={dict.landing.pillar1Tag}
        lead={dict.landing.pillar1Desc}
        features={dict.landing.apps1}
        accent="cyan"
      />
      <SiteFooter />
    </div>
  );
}
