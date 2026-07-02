"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { Avatar, LinkButton } from "./ui";

export function AuthControls({
  user,
  tone = "dark",
}: {
  user: { name: string; role: string } | null;
  tone?: "dark" | "light";
}) {
  const { dict } = useI18n();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  const textColor = tone === "light" ? "text-white/90" : "text-navy";

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className={`hidden text-sm font-medium hover:text-cyan sm:block ${textColor}`}
        >
          {dict.common.login}
        </Link>
        <LinkButton href="/signup" size="sm">
          {dict.common.join}
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={
          user.role === "ADMIN" ? "/admin" : "/community"
        }
        className="flex items-center gap-2"
      >
        <Avatar name={user.name} size={30} />
        <span className={`hidden text-sm font-medium sm:block ${textColor}`}>
          {user.name.split(" ")[0]}
        </span>
      </Link>
      <button
        onClick={logout}
        className={`text-sm hover:text-cyan ${tone === "light" ? "text-white/70" : "text-muted"}`}
      >
        {dict.common.logout}
      </button>
    </div>
  );
}
