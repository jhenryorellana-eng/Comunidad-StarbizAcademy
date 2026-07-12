import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { dayChip, eventRange, monthKey } from "@/lib/format";
import { SpaceHeader, SpaceBanner } from "@/components/community/SpaceHeader";
import { RsvpButton } from "@/components/community/RsvpButton";
import { Badge, cn } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Stagger, StaggerItem } from "@/components/motion";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { Prisma } from "@prisma/client";

type EventRow = Prisma.EventGetPayload<{
  include: { _count: { select: { rsvps: true } } };
}>;

function statusOf(e: EventRow, now: Date): "LIVE" | "PAST" | "UPCOMING" {
  if (e.status === "LIVE") return "LIVE";
  const end = e.endsAt ?? new Date(e.startsAt.getTime() + 2 * 3600_000);
  if (end < now) return "PAST";
  return "UPCOMING";
}

function StatusBadge({ status, E }: { status: string; E: Dict["community"]["events"] }) {
  if (status === "LIVE") return <Badge tone="live">{E.statusLive}</Badge>;
  if (status === "PAST") return <Badge tone="neutral">{E.statusPast}</Badge>;
  return <Badge tone="cyan">{E.statusUpcoming}</Badge>;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "upcoming" } = await searchParams;
  const { locale, dict } = await getDict();
  const user = await getCurrentUser();
  const E = dict.community.events;
  const now = new Date();

  const where =
    filter === "past"
      ? { startsAt: { lt: now } }
      : filter === "all"
        ? {}
        : { startsAt: { gte: new Date(now.getTime() - 3 * 3600_000) } };

  const events = await prisma.event.findMany({
    where,
    orderBy: { startsAt: filter === "past" ? "desc" : "asc" },
    include: { _count: { select: { rsvps: true } } },
  });

  const myRsvps = user
    ? new Set(
        (
          await prisma.rsvp.findMany({
            where: { userId: user.id },
            select: { eventId: true },
          })
        ).map((r) => r.eventId),
      )
    : new Set<string>();

  // Lista cronológica agrupada por mes
  const groups = new Map<string, typeof events>();
  for (const e of events) {
    const k = monthKey(e.startsAt, locale);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(e);
  }

  const tabs: Array<[string, string]> = [
    ["upcoming", E.upcoming],
    ["past", E.past],
    ["all", E.all],
  ];

  return (
    <div>
      <SpaceHeader icon="events" title={E.title} />
      <SpaceBanner />

      {/* filtros */}
      <div className="mb-6 flex gap-2">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            href={key === "upcoming" ? "/comunidad/eventos" : `/comunidad/eventos?filter=${key}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filter === key
                ? "border-navy bg-navy text-white"
                : "border-surface-line bg-paper text-ink hover:border-navy/30",
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-line bg-paper p-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-cyan">
            <Icon name="events" size={20} />
          </span>
          <p className="mt-3 text-muted">{E.empty}</p>
        </div>
      ) : (
        [...groups.entries()].map(([month, items]) => (
          <section key={month} className="mb-8">
            <div className="mb-3 flex items-center gap-2.5">
              <span
                className="animate-led h-1.5 w-1.5 rounded-full bg-cyan-bright shadow-[0_0_8px_2px_rgba(34,211,238,0.6)]"
                aria-hidden
              />
              <h3 className="text-lg font-extrabold text-navy">{month}</h3>
            </div>
            <Stagger className="space-y-3">
              {items.map((e) => {
                const chip = dayChip(e.startsAt, locale);
                const status = statusOf(e, now);
                return (
                  <StaggerItem
                    key={e.id}
                    className={cn(
                      "group flex flex-col gap-4 rounded-2xl border bg-paper p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center",
                      status === "LIVE"
                        ? "border-rose-300 shadow-[0_0_24px_rgba(244,63,94,0.12)]"
                        : "border-surface-line hover:border-cyan/30",
                    )}
                  >
                    {/* Bloque de fecha a la izquierda */}
                    <div
                      className={cn(
                        "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl",
                        status === "LIVE"
                          ? "bg-navy text-white"
                          : "bg-cream-200 text-navy",
                      )}
                    >
                      <span className="text-xl font-extrabold leading-none">{chip.day}</span>
                      <span
                        className={cn(
                          "text-[0.7rem] font-semibold tracking-wide",
                          status === "LIVE" ? "text-cyan-bright" : "text-muted",
                        )}
                      >
                        {chip.month}
                      </span>
                    </div>

                    {/* Contenido */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-navy">{e.title}</h4>
                        <StatusBadge status={status} E={E} />
                      </div>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                        <Icon name="clock" size={14} /> {eventRange(e.startsAt, e.endsAt, locale)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                        <Icon name="pin" size={14} />{" "}
                        {e.isOnline ? dict.common.online : e.location}
                      </p>
                    </div>

                    {/* Acción: registrarse, o la grabación si ya pasó */}
                    <div className="shrink-0">
                      {status === "PAST" ? (
                        e.recordingUrl ? (
                          <a
                            href={e.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-navy/25 px-4 py-1.5 text-sm font-medium text-navy transition-colors hover:border-cyan hover:bg-cyan-50 hover:text-cyan-700"
                          >
                            <Icon name="play" size={14} />
                            {E.recording}
                          </a>
                        ) : (
                          <span className="text-xs text-muted">
                            {e._count.rsvps > 0 ? `${e._count.rsvps} ${E.attendees}` : ""}
                          </span>
                        )
                      ) : (
                        <RsvpButton
                          eventId={e.id}
                          initialGoing={myRsvps.has(e.id)}
                          initialCount={e._count.rsvps}
                          loggedIn={!!user}
                        />
                      )}
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </section>
        ))
      )}
    </div>
  );
}
