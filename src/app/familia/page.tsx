import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { ageInYears, formatDate } from "@/lib/format";
import { ROLES } from "@/lib/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Avatar, Badge, Kicker } from "@/components/ui";
import { Icon } from "@/components/icons";
import { AddChildForm } from "@/components/family/AddChildForm";

/**
 * Mi familia — el padre/tutor crea y ve las cuentas de sus CEO Junior.
 * Es la única puerta de entrada de menores a la comunidad (registro parental).
 */
export default async function FamiliaPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== ROLES.PARENT && session.role !== ROLES.ADMIN) {
    redirect("/comunidad");
  }
  const { locale, dict } = await getDict();
  const F = dict.family;

  const children = await prisma.user.findMany({
    where: { parentId: session.sub },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      building: true,
      birthdate: true,
      createdAt: true,
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container-ac flex-1 py-10 md:py-14">
        <Kicker>{F.kicker}</Kicker>
        <h1 className="mt-2 text-3xl font-extrabold text-navy sm:text-4xl">{F.title}</h1>
        <p className="mt-3 max-w-2xl text-muted">{F.subtitle}</p>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_400px]">
          {/* ---- Tus CEO Junior ---- */}
          <section>
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">
              {F.childrenTitle}
            </h2>
            {children.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-surface-line bg-paper p-10 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-cyan">
                  <Icon name="members" size={20} />
                </span>
                <p className="mt-3 font-semibold text-navy">{F.empty}</p>
                <p className="mt-1 text-sm text-muted">{F.emptyHint}</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {children.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-4 rounded-2xl border border-surface-line bg-paper p-5"
                  >
                    <Avatar name={c.name} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-navy">{c.name}</p>
                        {c.birthdate && (
                          <Badge tone="cyan">
                            {ageInYears(c.birthdate)} {F.years}
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted">{c.email}</p>
                      {c.building && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink/85">
                          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                          {c.building}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted">
                        {F.joined} {formatDate(c.createdAt, locale)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ---- Agregar CEO Junior ---- */}
          <section className="rounded-2xl border border-cyan/30 bg-paper p-6 shadow-[0_0_28px_rgba(8,145,178,0.08)] lg:sticky lg:top-24">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-cyan">
                <Icon name="plus" size={16} />
              </span>
              {F.addTitle}
            </h2>
            <div className="mt-5">
              <AddChildForm />
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
