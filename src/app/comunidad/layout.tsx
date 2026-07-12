import { getCurrentUser, isMember } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { CommunityNav } from "@/components/community/CommunityNav";
import { CommunityMobileNav } from "@/components/community/CommunityMobileNav";
import { PodcastPlayerProvider } from "@/components/community/PodcastPlayer";

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const member = isMember(user?.role);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader mobileMenu={false} />
      <PodcastPlayerProvider>
        <CommunityMobileNav isMember={member} />
        {/* pb-24 clears the fixed mobile bottom bar */}
        <div className="container-ac flex w-full flex-1 gap-6 pb-24 pt-4 lg:py-6">
          <CommunityNav isMember={member} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </PodcastPlayerProvider>
    </div>
  );
}
