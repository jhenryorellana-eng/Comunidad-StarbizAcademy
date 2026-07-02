"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

const ITEMS: Array<[string, string]> = [
  ["/admin", "Dashboard"],
  ["/admin/events", "Eventos"],
  ["/admin/podcast", "StarVoice"],
  ["/admin/chapters", "Cohortes"],
  ["/admin/observatory", "StarBooks"],
  ["/admin/posts", "Publicaciones"],
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <aside className="lg:w-52 lg:shrink-0">
      <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {ITEMS.map(([href, label]) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-navy text-white" : "text-ink hover:bg-navy/[0.05]",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
