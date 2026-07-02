import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n/server";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { Avatar, Badge } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";

const ROLE_LABEL: Record<string, { en: string; es: string; tone: "neutral" | "navy" | "cyan" | "green" }> = {
  MEMBER: { en: "CEO Junior", es: "CEO Junior", tone: "neutral" },
  PARENT: { en: "Padres 3.0", es: "Padres 3.0", tone: "cyan" },
  MENTOR: { en: "Mentor", es: "Mentor", tone: "navy" },
  ADMIN: { en: "Team", es: "Equipo", tone: "green" },
};

export default async function MembersPage() {
  const { locale, dict } = await getDict();
  const members = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <SpaceHeader icon="members" title={dict.community.membersDir.title} />
      <SpaceBanner />

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => {
          const role = ROLE_LABEL[m.role] ?? ROLE_LABEL.MEMBER;
          const since = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
            month: "short",
            year: "numeric",
          }).format(m.createdAt);
          return (
            <StaggerItem
              key={m.id}
              className="rounded-2xl border border-surface-line bg-paper p-5"
            >
              <div className="flex items-center gap-3">
                <Avatar name={m.name} size={48} />
                <div className="min-w-0">
                  <p className="truncate font-bold text-navy">{m.name}</p>
                  <Badge tone={role.tone}>{locale === "es" ? role.es : role.en}</Badge>
                </div>
              </div>
              {m.bio && <p className="mt-3 line-clamp-2 text-sm text-muted">{m.bio}</p>}
              <p className="mt-3 text-xs text-muted">
                {[m.city, m.country].filter(Boolean).join(", ")}
                {(m.city || m.country) && " · "}
                {dict.community.membersDir.memberSince} {since}
              </p>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
