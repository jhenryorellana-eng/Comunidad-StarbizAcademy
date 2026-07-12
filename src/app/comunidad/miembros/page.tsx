import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n/server";
import { publicName } from "@/lib/format";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { ReportButton } from "@/components/community/ReportButton";
import { Avatar, Badge, cn } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";

const COUNTRY_FLAG: Record<string, string> = {
  "EE.UU.": "🇺🇸",
  "Estados Unidos": "🇺🇸",
  "Perú": "🇵🇪",
  "México": "🇲🇽",
};

const NEW_DAYS = 30;

function newArrivalsCutoff(): Date {
  return new Date(Date.now() - NEW_DAYS * 86_400_000);
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ pais?: string; filtro?: string }>;
}) {
  const { pais, filtro } = await searchParams;
  const { locale, dict } = await getDict();
  const M = dict.community.membersDir;

  const isNew = filtro === "nuevos";
  const members = await prisma.user.findMany({
    where: {
      ...(pais ? { country: pais } : {}),
      ...(isNew ? { createdAt: { gte: newArrivalsCutoff() } } : {}),
    },
    orderBy: { createdAt: isNew ? "desc" : "asc" },
    // Privacy: only what the public card needs ever leaves the server.
    select: {
      id: true,
      name: true,
      role: true,
      country: true,
      building: true,
      avatar: true,
    },
  });

  const countries = (
    await prisma.user.findMany({
      where: { country: { not: null } },
      select: { country: true },
      distinct: ["country"],
    })
  )
    .map((c) => c.country!)
    .sort();

  const filterHref = (nextPais?: string, nextFiltro?: string) => {
    const q = new URLSearchParams();
    if (nextPais) q.set("pais", nextPais);
    if (nextFiltro) q.set("filtro", nextFiltro);
    const qs = q.toString();
    return `/comunidad/miembros${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <SpaceHeader icon="members" title={M.title} />
      <SpaceBanner />

      {/* Filtros permitidos: país · recién llegados. Ninguno más. */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href={filterHref(undefined, isNew ? "nuevos" : undefined)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            !pais
              ? "border-navy bg-navy text-white"
              : "border-surface-line bg-paper text-ink hover:border-navy/30",
          )}
        >
          {M.filterAll}
        </Link>
        {countries.map((c) => (
          <Link
            key={c}
            href={filterHref(pais === c ? undefined : c, isNew ? "nuevos" : undefined)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              pais === c
                ? "border-navy bg-navy text-white"
                : "border-surface-line bg-paper text-ink hover:border-navy/30",
            )}
          >
            {COUNTRY_FLAG[c] ? `${COUNTRY_FLAG[c]} ` : ""}
            {c}
          </Link>
        ))}
        <span className="mx-1 h-5 w-px bg-surface-line" aria-hidden />
        <Link
          href={filterHref(pais, isNew ? undefined : "nuevos")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            isNew
              ? "border-cyan bg-cyan text-white"
              : "border-surface-line bg-paper text-ink hover:border-navy/30",
          )}
        >
          {M.filterNew}
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-line bg-paper p-12 text-center">
          <p className="text-muted">{M.empty}</p>
          <Link
            href="/signup"
            className="mt-3 inline-block font-semibold text-cyan hover:underline"
          >
            {dict.community.becomeMember} →
          </Link>
        </div>
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((m) => {
            const flag = m.country ? COUNTRY_FLAG[m.country] : undefined;
            return (
              <StaggerItem
                key={m.id}
                className="group relative flex h-full flex-col items-center rounded-2xl border border-surface-line bg-paper p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-cyan/30 hover:shadow-[0_12px_35px_rgba(8,145,178,0.1)]"
              >
                <ReportButton
                  targetType="MEMBER"
                  targetId={m.id}
                  className="absolute right-3 top-3"
                />
                {/* Los 4 campos de la tarjeta — exactamente estos */}
                <span className="rounded-full bg-navy p-1 shadow-[0_0_18px_rgba(26,39,68,0.25)]">
                  <Avatar name={m.name} src={m.avatar} size={56} />
                </span>
                <p className="mt-3 font-bold text-navy">{publicName(m.name)}</p>
                {m.country && (
                  <p className="mt-0.5 text-sm text-muted">
                    {flag ? `${flag} ` : ""}
                    {m.country}
                  </p>
                )}
                <p className="mt-2 line-clamp-2 text-sm font-medium italic text-cyan-700">
                  “{m.building || M.buildingFallback}”
                </p>
                {m.role === "MENTOR" && (
                  <Badge tone="navy" className="mt-2.5">
                    {locale === "es" ? "Mentor verificado" : "Verified mentor"}
                  </Badge>
                )}
                {/* Conecta: abre la conversación pública — nunca un chat privado */}
                <Link
                  href="/comunidad/posts"
                  className="mt-4 w-full rounded-full border border-navy/25 px-4 py-1.5 text-sm font-medium text-navy transition-colors hover:border-cyan hover:bg-cyan-50 hover:text-cyan-700"
                >
                  + {M.connect}
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
