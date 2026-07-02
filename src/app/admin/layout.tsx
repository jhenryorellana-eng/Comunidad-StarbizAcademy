import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/Star";
import { AuthControls } from "@/components/AuthControls";
import { AdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur">
        <div className="container-ac flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge tone="navy">Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted hover:text-navy">
              Ver sitio →
            </Link>
            <AuthControls user={{ name: user.name, role: user.role }} />
          </div>
        </div>
      </header>
      <div className="container-ac flex w-full flex-1 flex-col gap-6 py-6 lg:flex-row">
        <AdminNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
