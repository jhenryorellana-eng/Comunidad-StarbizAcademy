import { SiteHeader } from "@/components/SiteHeader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-14">
        {children}
      </main>
    </div>
  );
}
