import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/ui";
import { Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatDateTime } from "@/lib/format";
import { BOOTCAMP } from "@/lib/bootcamp";
import { ExportCsv } from "@/components/admin/ExportCsv";

/**
 * Inscripciones del Bootcamp Utah 2027.
 *
 * Existía el cobro y existía la tabla, pero NADIE podía ver quién había pagado:
 * la fila caía en `BootcampRegistration` y sólo se llegaba a ella consultando
 * Postgres a mano. Y de esos datos dependen las dos cartas de invitación que hay
 * que emitir por cada inscripción — sin esta pantalla el proceso se rompe justo
 * después de cobrar, que es el peor sitio.
 *
 * Lo que manda aquí es UNA pregunta: ¿a quién le falta la carta? Por eso las
 * inscripciones sin datos de pasaporte salen las primeras y marcadas, no en
 * orden cronológico.
 */
export default async function AdminBootcamp() {
  const inscripciones = await prisma.bootcampRegistration.findMany({
    orderBy: [{ profileComplete: "asc" }, { createdAt: "desc" }],
    include: {
      // Ahora el cupo cuelga de una cuenta real. Traer al padre y al hijo
      // permite escribirle a quien pagó sin buscar el correo a mano.
      parent: { select: { name: true, email: true } },
      child: { select: { name: true, email: true, birthdate: true } },
    },
  });

  const pagadas = inscripciones.filter((r) => r.status === "PAID");
  const pendientes = pagadas.filter((r) => !r.profileComplete);
  const reembolsadas = inscripciones.filter((r) => r.status === "REFUNDED");
  const recaudado = pagadas.reduce((s, r) => s + r.amountTotal, 0) / 100;
  const enPruebas = inscripciones.some((r) => !r.livemode);

  const fecha = (d: Date | null) =>
    d ? new Date(d).toISOString().slice(0, 10) : "—";

  return (
    <div>
      <PageTitle>Bootcamp Utah 2027</PageTitle>
      <p className="-mt-4 mb-6 text-sm text-muted">
        Cada inscripción son <strong className="text-navy">dos cartas</strong>: participante y
        acompañante. Los nombres tienen que ir exactamente como en el pasaporte.
      </p>

      {/* Resumen. Cuatro números, y el que importa es el segundo. */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { n: pagadas.length, t: `de ${BOOTCAMP.seats} cupos`, tono: "navy" as const },
          { n: pendientes.length, t: "sin datos de carta", tono: "gold" as const },
          { n: `$${recaudado.toLocaleString("es")}`, t: "recaudado", tono: "cyan" as const },
          { n: reembolsadas.length, t: "reembolsadas", tono: "plano" as const },
        ].map((c) => (
          <div
            key={c.t}
            className={
              c.tono === "gold" && pendientes.length > 0
                ? "rounded-2xl border border-gold/50 bg-gold/[0.08] p-4"
                : "rounded-2xl border border-surface-line bg-paper p-4"
            }
          >
            <p className="font-display text-2xl font-extrabold tabular-nums text-navy">{c.n}</p>
            <p className="mt-0.5 text-xs text-muted">{c.t}</p>
          </div>
        ))}
      </div>

      {enPruebas && (
        <p className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          <Icon name="clock" size={14} />
          Hay inscripciones en <strong>modo prueba</strong>. Van marcadas y no son dinero real.
        </p>
      )}

      {inscripciones.length === 0 ? (
        <p className="rounded-xl border border-dashed border-surface-line bg-paper p-8 text-center text-sm text-muted">
          Todavía no hay inscripciones. Cuando alguien pague, aparece aquí al momento —
          lo escribe el webhook de Stripe, no hace falta refrescar nada a mano.
        </p>
      ) : (
        <>
          <div className="mb-3 flex justify-end">
            <ExportCsv
              filename="inscripciones-bootcamp-utah-2027.csv"
              rows={inscripciones.map((r) => ({
                Pagado: formatDateTime(r.createdAt, "es"),
                Estado: r.status,
                Correo: r.parent?.email ?? r.email,
                Padre: r.parent?.name ?? r.payerName ?? "",
                Participante: r.child?.name ?? r.participantName ?? "",
                Nacimiento: fecha(r.participantBirthdate),
                Acompanante: r.companionName ?? "",
                Telefono: r.phone ?? "",
                Pais: r.country ?? "",
                Importe: (r.amountTotal / 100).toString(),
                Modo: r.livemode ? "real" : "prueba",
                StripeSession: r.stripeSessionId,
              }))}
            />
          </div>

          <div className="space-y-2">
            {inscripciones.map((r) => {
              const falta = r.status === "PAID" && !r.profileComplete;
              return (
                <div
                  key={r.id}
                  className={
                    falta
                      ? "rounded-xl border border-gold/50 bg-gold/[0.06] p-4"
                      : "rounded-xl border border-surface-line bg-paper p-4"
                  }
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-bold text-navy">
                      {r.child?.name ?? r.participantName ?? r.payerName ?? r.email}
                    </p>
                    {!r.childId && (
                      <Badge tone="neutral">sin cuenta vinculada</Badge>
                    )}
                    {r.status === "REFUNDED" ? (
                      <Badge tone="neutral">Reembolsada</Badge>
                    ) : falta ? (
                      <Badge tone="live">Faltan datos de la carta</Badge>
                    ) : (
                      <Badge tone="green">Lista para emitir</Badge>
                    )}
                    {!r.livemode && <Badge tone="neutral">prueba</Badge>}
                    <span className="ml-auto text-xs tabular-nums text-muted">
                      {formatDateTime(r.createdAt, "es")} · ${(r.amountTotal / 100).toFixed(0)}
                    </span>
                  </div>

                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                    <Dato k="Correo" v={r.parent?.email ?? r.email} />
                    <Dato k="Quien pagó" v={r.parent?.name ?? r.payerName} />
                    <Dato k="Cuenta del chico" v={r.child?.email} />
                    <Dato k="Participante" v={r.participantName} destacado />
                    <Dato k="Nacimiento" v={fecha(r.participantBirthdate)} />
                    <Dato k="Acompañante" v={r.companionName} destacado />
                    <Dato k="Teléfono" v={r.phone} />
                    <Dato k="País" v={r.country} />
                  </dl>

                  {falta && (
                    <p className="mt-3 text-xs text-gold-700">
                      Pagó pero no envió el formulario. Escríbele a {r.email} para que complete
                      los nombres tal como aparecen en el pasaporte.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/** Un dato. Los que van a la carta se marcan: son los que no admiten erratas. */
function Dato({
  k,
  v,
  destacado,
}: {
  k: string;
  v: string | null | undefined;
  destacado?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-muted">{k}:</dt>
      <dd
        className={
          v
            ? destacado
              ? "min-w-0 truncate font-semibold text-navy"
              : "min-w-0 truncate text-ink"
            : "text-muted/50"
        }
      >
        {v || "—"}
      </dd>
    </div>
  );
}
