import Link from "next/link";
import { getRailData } from "@/lib/communityData";
import { getDict } from "@/lib/i18n/server";
import { publicName } from "@/lib/format";
import { Icon } from "@/components/icons";
import { Avatar, cn } from "@/components/ui";

/**
 * Tercera columna de la comunidad (solo en pantallas anchas).
 *
 * En escritorio el contenido vivía en una columna estrecha con más de media
 * pantalla vacía a la derecha: el sitio parecía inacabado. Esta columna llena
 * ese hueco con lo que de verdad mueve una comunidad —la oferta vigente, lo
 * que va a pasar y quién acaba de llegar— y de paso mantiene el acceso al
 * bootcamp visible durante todo el scroll, no solo al principio del feed.
 *
 * A partir de `xl` (1280px). Por debajo no existe: en pantallas medias
 * robaría ancho a la lectura, que es lo que importa.
 */
export async function CommunityRail() {
  const { dict, locale } = await getDict();
  const R = dict.community.rail;
  const B = dict.bootcamp;

  const { events, showingPast, members } = await getRailData();

  const fmtDate = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "short",
  });
  const fmtTime = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <aside className="hidden w-[320px] shrink-0 xl:block">
      <div className="sticky top-20 flex flex-col gap-4">
        {/* La oferta vigente, siempre a la vista mientras se recorre el feed. */}
        <Link
          href="/bootcamp"
          className="group relative overflow-hidden rounded-2xl border border-surface-line bg-paper p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_12px_30px_-12px_rgba(251,191,36,0.5)]"
        >
          <span
            className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-gold-300 via-gold to-gold-700"
            aria-hidden
          />
          <span
            className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-gold"
            aria-hidden
          >
            <Icon name="star" size={19} />
          </span>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-gold-700">
            {B.feedEyebrow}
          </p>
          <p className="mt-1.5 font-display text-[1.02rem] font-bold leading-snug text-navy [text-wrap:balance]">
            {B.feedTitle}
          </p>
          <p className="mt-2 text-xs text-muted">
            {B.feedSeats} · {B.feedDeadline}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 transition-transform group-hover:translate-x-0.5">
            {B.feedCta}
            <Icon name="arrowRight" size={14} />
          </span>
        </Link>

        {/* Próximos eventos */}
        <section className="rounded-2xl border border-surface-line bg-paper p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">
              {showingPast ? R.recent : R.upcoming}
            </h2>
            <Link
              href="/comunidad/eventos"
              className="text-xs font-semibold text-cyan-700 hover:underline"
            >
              {R.seeAll}
            </Link>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-muted">{R.noEvents}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {events.map((e) => {
                // startsAt llega como cadena ISO (ver lib/communityData).
                const fecha = new Date(e.startsAt);
                return (
                <li key={e.id}>
                  <Link
                    href="/comunidad/eventos"
                    className="group flex gap-3 rounded-xl p-1.5 transition-colors hover:bg-surface"
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl",
                        showingPast ? "bg-surface text-muted" : "bg-cyan-50 text-cyan-700",
                      )}
                    >
                      <span className="font-display text-sm font-extrabold leading-none">
                        {fecha.getDate()}
                      </span>
                      <span className="mt-0.5 text-[0.55rem] font-bold uppercase leading-none">
                        {fmtDate.format(fecha).replace(/^\d+\s*/, "")}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-navy group-hover:text-cyan-700">
                        {e.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {fmtTime.format(fecha)} ·{" "}
                        {e.isOnline ? dict.common.online : dict.common.inPerson}
                      </span>
                    </span>
                  </Link>
                </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Quién acaba de llegar */}
        <section className="rounded-2xl border border-surface-line bg-paper p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">
              {R.newcomers}
            </h2>
            <Link
              href="/comunidad/miembros"
              className="text-xs font-semibold text-cyan-700 hover:underline"
            >
              {R.seeAll}
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                {/* Privacidad: el apellido completo nunca sale del servidor. */}
                <Avatar name={publicName(m.name)} size={34} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-navy">
                    {publicName(m.name)}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {m.building || m.country}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
