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
 * DOS LISTAS, NO UNA. Las reservas se guardan cuando alguien rellena el
 * formulario, antes de pagar. Eso significa que aquí hay dos cosas distintas:
 *
 *  · PAGADAS   — cupos confirmados. De aquí salen las cartas y las boletas.
 *  · PENDIENTES — rellenaron todo y no llegaron a pagar. NO son basura: son
 *    contactos con nombre, correo y país. Son los que hay que llamar.
 *
 * Si la fila naciera en el webhook, esa segunda lista no existiría.
 */
const NIVEL: Record<string, string> = {
  PRIMARIA: "Primaria",
  SECUNDARIA: "Secundaria",
};

function edadDe(fecha: Date | null): number | null {
  if (!fecha) return null;
  const hoy = new Date();
  let a = hoy.getUTCFullYear() - fecha.getUTCFullYear();
  const m = hoy.getUTCMonth() - fecha.getUTCMonth();
  if (m < 0 || (m === 0 && hoy.getUTCDate() < fecha.getUTCDate())) a--;
  return a;
}

export default async function AdminBootcamp() {
  const todas = await prisma.bootcampRegistration.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pagadas = todas.filter((r) => r.status === "PAID");
  const pendientes = todas.filter((r) => r.status === "PENDING");
  const reembolsadas = todas.filter((r) => r.status === "REFUNDED");
  const recaudado = pagadas.reduce((s, r) => s + r.amountTotal, 0) / 100;
  const enPruebas = pagadas.some((r) => !r.livemode);

  const fecha = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

  const filasCsv = todas.map((r) => ({
    Estado: r.status,
    Fecha: formatDateTime(r.createdAt, "es"),
    Participante: r.participantName,
    Nacimiento: fecha(r.participantBirthdate),
    Edad: String(edadDe(r.participantBirthdate) ?? ""),
    Documento: r.documentId ?? "",
    Nacionalidad: r.nationality ?? "",
    Direccion: r.address ?? "",
    Residencia: r.residence ?? "",
    Nivel: r.academicLevel ? NIVEL[r.academicLevel] ?? r.academicLevel : "",
    Acompanante: r.companionName ?? "",
    PadreNombre: r.payerName ?? "",
    PadreCorreo: r.email,
    Telefono: r.phone ?? "",
    Importe: r.status === "PAID" ? String(r.amountTotal / 100) : "",
    Modo: r.livemode ? "real" : "prueba",
  }));

  return (
    <div>
      <PageTitle>Bootcamp Utah 2027</PageTitle>
      <p className="-mt-4 mb-6 text-sm text-muted">
        Cada cupo pagado son <strong className="text-navy">dos cartas</strong>: participante y
        acompañante. Los nombres van exactamente como en el pasaporte.
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Tarjeta n={pagadas.length} t={`de ${BOOTCAMP.seats} cupos pagados`} />
        <Tarjeta
          n={pendientes.length}
          t="rellenaron y no pagaron"
          alerta={pendientes.length > 0}
        />
        <Tarjeta n={`$${recaudado.toLocaleString("es")}`} t="recaudado" />
        <Tarjeta n={reembolsadas.length} t="reembolsadas" />
      </div>

      {enPruebas && (
        <p className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          <Icon name="clock" size={14} />
          Hay pagos en <strong>modo prueba</strong>. Van marcados y no son dinero real.
        </p>
      )}

      {todas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-surface-line bg-paper p-8 text-center text-sm text-muted">
          Todavía no hay reservas. En cuanto alguien rellene el formulario aparece aquí —
          aunque no llegue a pagar.
        </p>
      ) : (
        <>
          <div className="mb-3 flex justify-end">
            <ExportCsv filename="bootcamp-utah-2027.csv" rows={filasCsv} />
          </div>

          {pendientes.length > 0 && (
            <Seccion
              titulo="Sin pagar — para llamar"
              nota="Dieron todos sus datos y se quedaron a un paso. Son el contacto más caliente que hay."
            >
              {pendientes.map((r) => (
                <Ficha key={r.id} r={r} />
              ))}
            </Seccion>
          )}

          {pagadas.length > 0 && (
            <Seccion titulo="Cupos confirmados" nota="Listos para emitir las dos cartas.">
              {pagadas.map((r) => (
                <Ficha key={r.id} r={r} />
              ))}
            </Seccion>
          )}

          {reembolsadas.length > 0 && (
            <Seccion titulo="Reembolsadas">
              {reembolsadas.map((r) => (
                <Ficha key={r.id} r={r} />
              ))}
            </Seccion>
          )}
        </>
      )}
    </div>
  );
}

function Tarjeta({
  n,
  t,
  alerta,
}: {
  n: number | string;
  t: string;
  alerta?: boolean;
}) {
  return (
    <div
      className={
        alerta
          ? "rounded-2xl border border-gold/50 bg-gold/[0.08] p-4"
          : "rounded-2xl border border-surface-line bg-paper p-4"
      }
    >
      <p className="font-display text-2xl font-extrabold tabular-nums text-navy">{n}</p>
      <p className="mt-0.5 text-xs text-muted">{t}</p>
    </div>
  );
}

function Seccion({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
        {titulo}
      </h2>
      {nota && <p className="mb-3 mt-0.5 text-xs text-muted">{nota}</p>}
      <div className="space-y-2">{children}</div>
    </section>
  );
}

type Reserva = Awaited<
  ReturnType<typeof prisma.bootcampRegistration.findMany>
>[number];

function Ficha({ r }: { r: Reserva }) {
  const edad = edadDe(r.participantBirthdate);
  const pendiente = r.status === "PENDING";

  return (
    <div
      className={
        pendiente
          ? "rounded-xl border border-gold/45 bg-gold/[0.05] p-4"
          : "rounded-xl border border-surface-line bg-paper p-4"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display font-bold text-navy">{r.participantName}</p>
        {edad !== null && <Badge tone="cyan">{edad} años</Badge>}
        {r.status === "PAID" && <Badge tone="green">Pagado</Badge>}
        {pendiente && <Badge tone="live">Sin pagar</Badge>}
        {r.status === "REFUNDED" && <Badge tone="neutral">Reembolsada</Badge>}
        {r.status === "PAID" && !r.livemode && <Badge tone="neutral">prueba</Badge>}
        <span className="ml-auto text-xs tabular-nums text-muted">
          {formatDateTime(r.createdAt, "es")}
          {r.status === "PAID" && ` · $${(r.amountTotal / 100).toFixed(0)}`}
        </span>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        <Dato k="Documento" v={r.documentId} destacado />
        <Dato k="Nacimiento" v={r.participantBirthdate?.toISOString().slice(0, 10)} />
        <Dato k="Nacionalidad" v={r.nationality} />
        <Dato k="Nivel" v={r.academicLevel ? NIVEL[r.academicLevel] ?? r.academicLevel : null} />
        <Dato k="Residencia" v={r.residence} />
        <Dato k="Dirección" v={r.address} />
        <Dato k="Acompañante" v={r.companionName} destacado />
        <Dato k="Padre/tutor" v={r.payerName} />
        <Dato k="Correo" v={r.email} />
        <Dato k="Teléfono" v={r.phone} />
      </dl>

      {pendiente && (
        <p className="mt-3 text-xs text-gold-700">
          Llegó hasta el final del formulario y no completó el pago. Escríbele a {r.email}.
        </p>
      )}
      {r.status === "PAID" && !r.companionName && (
        <p className="mt-3 text-xs text-gold-700">
          Falta el nombre del acompañante — sin él no se puede emitir la segunda carta.
        </p>
      )}
    </div>
  );
}

/** Los datos que van a la carta se marcan: son los que no admiten erratas. */
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
