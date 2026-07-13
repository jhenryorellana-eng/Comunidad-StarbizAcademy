import { getDict } from "@/lib/i18n/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionTabs } from "@/components/SectionTabs";
import { SectionComingSoon } from "@/components/SectionComingSoon";

// Sección "Padres" — tendrá sus propios espacios, como la Comunidad.
export default async function PadresSection() {
  const { dict } = await getDict();
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader mobileMenu={false} />
      <SectionTabs />
      <SectionComingSoon
        title={dict.landing.pillar2Title}
        tag={dict.landing.pillar2Tag}
        lead={dict.landing.pillar2Desc}
        features={dict.landing.apps2}
        accent="gold"
      />
      <SiteFooter />
    </div>
  );
}
