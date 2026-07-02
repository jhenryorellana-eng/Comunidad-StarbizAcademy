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

  const featured = filter !== "past" ? events.find((e) => e.featured) : undefined;
  const list = events.filter((e) => e.id !== featured?.id);

  // group remaining by month
  const groups = new Map<string, typeof list>();
  for (const e of list) {
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

      {/* filters */}
      <div className="mb-6 flex gap-2">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            href={`/community/events?filter=${key}`}
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

      {/* featured */}
      {featured && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-surface-line bg-paper">
          <div className="relative h-40 bg-gradient-to-br from-cyan via-cyan-bright to-navy">
            {featured.status === "LIVE" && (
              <span className="absolute left-4 top-4">
                <Badge tone="live" className="bg-white/90">
                  <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  {locale === "es" ? "En vivo" : "Live now"}
                </Badge>
              </span>
            )}
          </div>
          <div className="p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan">
              {E.featured}
            </p>
            <h2 className="text-xl font-bold text-navy">{featured.title}</h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <Icon name="clock" size={15} /> {eventRange(featured.startsAt, featured.endsAt, locale)}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <Icon name="pin" size={15} />{" "}
              {featured.isOnline ? dict.common.online : featured.location}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-ink/80">{featured.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge>{featured.isOnline ? dict.common.online : dict.common.inPerson}</Badge>
              <Badge>{featured.host}</Badge>
              <Badge tone="cyan">{featured.price || dict.common.free}</Badge>
            </div>
            <div className="mt-5">
              <RsvpButton
                eventId={featured.id}
                initialGoing={myRsvps.has(featured.id)}
                initialCount={featured._count.rsvps}
                loggedIn={!!user}
              />
            </div>
          </div>
        </div>
      )}

      {/* grouped list */}
      {list.length === 0 && !featured ? (
        <EmptyState text={E.empty} />
      ) : (
        [...groups.entries()].map(([month, items]) => (
          <section key={month} className="mb-8">
            <h3 className="mb-3 text-lg font-bold text-navy">{month}</h3>
            <Stagger className="space-y-3">
              {items.map((e) => {
                const chip = dayChip(e.startsAt, locale);
                return (
                  <StaggerItem
                    key={e.id}
                    className="flex flex-col gap-4 rounded-2xl border border-surface-line bg-paper p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-cream-200 text-navy">
                      <span className="text-xl font-extrabold leading-none">{chip.day}</span>
                      <span className="text-[0.7rem] font-semibold tracking-wide text-muted">
                        {chip.month}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-navy">{e.title}</h4>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                        <Icon name="clock" size={14} /> {eventRange(e.startsAt, e.endsAt, locale)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                        <Icon name="pin" size={14} />{" "}
                        {e.isOnline ? dict.common.online : e.location}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <RsvpButton
                        eventId={e.id}
                        initialGoing={myRsvps.has(e.id)}
                        initialCount={e._count.rsvps}
                        loggedIn={!!user}
                      />
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-line bg-paper p-12 text-center text-muted">
      {text}
    </div>
  );
}
