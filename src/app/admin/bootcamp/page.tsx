import { prisma } from "@/lib/prisma";
import { PageTitle, Field, SelectField, TextareaField, DeleteButton } from "@/components/admin/ui";
import { Badge, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatDateTime } from "@/lib/format";
import { BOOTCAMP } from "@/lib/bootcamp";
import { PAISES } from "@/lib/paises";
import { ExportCsv } from "@/components/admin/ExportCsv";
import { crearReservaManual, marcarPagadaManual, borrarReserva } from "../actions";

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
 * Y NO TODO SE COBRA POR STRIPE. Hay clientes que pagan por transferencia, en
 * efectivo o por Yape. Esa plata ocupa un cupo igual, así que se puede dar de
 * alta a mano y se puede marcar como pagada una pendiente. Se anota siempre
 * CÓMO se pagó y con qué referencia: el dinero de Stripe se concilia solo, el
 * de mano hay que poder encontrarlo en el extracto del banco.
 */
const NIVEL: Record<string, string> = {
  PRIMARIA: "Primaria",
  SECUNDARIA: "Secundaria",
};

const METODO: Record<string, string> = {
  STRIPE: "Stripe",
  TRANSFERENCIA: "Transferencia",
  EFECTIVO: "Efectivo",
  OTRO: "Otro",
};

const OPCIONES_METODO = [
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "OTRO", label: "Otro (Yape, Plin…)" },
];

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
  // El total se parte por origen: lo de Stripe se concilia solo, lo de mano
  // hay que cuadrarlo contra el banco. Verlo junto esconde justo esa mitad.
  const porStripe = pagadas
    .filter((r) => r.paymentMethod === "STRIPE")
    .reduce((s, r) => s + r.amountTotal, 0) / 100;
  const aMano = recaudado - porStripe;

  // El aviso de "modo prueba" sólo tiene sentido para Stripe: un pago en
  // efectivo no tiene livemode, y marcarlo como prueba sería mentir.
  const enPruebas = pagadas.some((r) => r.paymentMethod === "STRIPE" && !r.livemode);

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
    FormaDePago: METODO[r.paymentMethod] ?? r.paymentMethod,
    Referencia: r.paymentRef ?? "",
    AltaPor: r.registeredBy ?? "",
    Notas: r.notes ?? "",
    Modo: r.paymentMethod === "STRIPE" ? (r.livemode ? "real" : "prueba") : "fuera de Stripe",
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
        <Tarjeta n={pendientes.length} t="rellenaron y no pagaron" alerta={pendientes.length > 0} />
        <Tarjeta
          n={`$${recaudado.toLocaleString("es")}`}
          t="recaudado"
          pie={aMano > 0 ? `$${porStripe.toLocaleString("es")} Stripe · $${aMano.toLocaleString("es")} a mano` : undefined}
        />
        <Tarjeta n={reembolsadas.length} t="reembolsadas" />
      </div>

      {enPruebas && (
        <p className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          <Icon name="clock" size={14} />
          Hay pagos de Stripe en <strong>modo prueba</strong>. Van marcados y no son dinero real.
        </p>
      )}

      {/* ── ALTA A MANO ──────────────────────────────────────────────────
          Plegada por defecto: el panel se usa sobre todo para consultar, y
          un formulario de quince campos abierto arriba estorba cada vez. */}
      <details className="mb-6 rounded-2xl border border-surface-line bg-paper">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-navy">
          <span className="flex items-center gap-2">
            <Icon name="plus" size={14} className="text-cyan" />
            Registrar una reserva pagada fuera de Stripe
          </span>
        </summary>

        <form action={crearReservaManual} className="border-t border-surface-line p-5">
          <p className="mb-4 text-xs leading-relaxed text-muted">
            Para quien pagó por transferencia, en efectivo o por Yape. Se anota quién lo dio de alta
            y con qué referencia, para poder cuadrarlo después contra el banco.
          </p>

          <p className="mb-3 font-display text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
            Quién viaja
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo del participante" name="participantName" required span />
            <Field label="Fecha de nacimiento" name="participantBirthdate" type="date" />
            <Field label="Pasaporte o DNI" name="documentId" />
            <SelectField
              label="Nacionalidad"
              name="nationality"
              options={[
                { value: "", label: "—" },
                ...PAISES.map((p) => ({ value: p.gentilicio, label: `${p.nombre} · ${p.gentilicio}` })),
              ]}
            />
            <SelectField
              label="Nivel académico"
              name="academicLevel"
              options={[
                { value: "", label: "—" },
                { value: "PRIMARIA", label: "Primaria" },
                { value: "SECUNDARIA", label: "Secundaria" },
              ]}
            />
            <Field label="Dirección actual" name="address" span />
            <Field label="Ciudad y país de residencia" name="residence" placeholder="Lima, Perú" span />
          </div>

          <p className="mb-3 mt-6 font-display text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
            Quién paga
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre del padre o tutor" name="payerName" />
            <Field label="Correo electrónico" name="email" type="email" required />
            <Field label="Teléfono" name="phone" placeholder="+51 999 999 999" />
            <Field label="Nombre del acompañante" name="companionName" />
          </div>

          <p className="mb-3 mt-6 font-display text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
            El pago
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Forma de pago" name="paymentMethod" options={OPCIONES_METODO} />
            <Field
              label="Referencia u operación"
              name="paymentRef"
              placeholder="Nº de voucher, operación…"
            />
            <Field
              label="Importe en USD"
              name="amount"
              type="number"
              defaultValue={BOOTCAMP.priceUSD}
            />
            <SelectField
              label="Estado"
              name="status"
              defaultValue="PAID"
              options={[
                { value: "PAID", label: "Pagada — el dinero ya está" },
                { value: "PENDING", label: "Apartada — todavía no ha pagado" },
              ]}
            />
            <TextareaField label="Notas" name="notes" rows={2} />
          </div>

          <div className="mt-5">
            <Button type="submit" size="sm">
              Registrar reserva
            </Button>
          </div>
        </form>
      </details>

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
  pie,
  alerta,
}: {
  n: number | string;
  t: string;
  pie?: string;
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
      {pie && <p className="mt-1.5 text-[0.68rem] leading-snug text-muted/80">{pie}</p>}
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
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-navy">{titulo}</h2>
      {nota && <p className="mb-3 mt-0.5 text-xs text-muted">{nota}</p>}
      <div className="space-y-2">{children}</div>
    </section>
  );
}

type Reserva = Awaited<ReturnType<typeof prisma.bootcampRegistration.findMany>>[number];

function Ficha({ r }: { r: Reserva }) {
  const edad = edadDe(r.participantBirthdate);
  const pendiente = r.status === "PENDING";
  const fueraDeStripe = r.paymentMethod !== "STRIPE";
  // Una pagada por Stripe no se borra desde aquí: dejaría un cobro huérfano
  // en la pasarela. Ésas se reembolsan primero en Stripe.
  const sePuedeBorrar = !(r.status === "PAID" && r.paymentMethod === "STRIPE" && r.stripeSessionId);

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
        {r.status === "PAID" && fueraDeStripe && (
          <Badge tone="navy">{METODO[r.paymentMethod] ?? r.paymentMethod}</Badge>
        )}
        {r.status === "PAID" && !fueraDeStripe && !r.livemode && (
          <Badge tone="neutral">prueba</Badge>
        )}
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
        {r.paymentRef && <Dato k="Referencia" v={r.paymentRef} />}
        {r.registeredBy && <Dato k="Alta por" v={r.registeredBy} />}
      </dl>

      {r.notes && (
        <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs leading-snug text-ink">
          {r.notes}
        </p>
      )}

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

      {/* ── COBRAR A MANO ──────────────────────────────────────────────
          El caso más frecuente: rellenó el formulario, no pagó con tarjeta y
          luego hizo una transferencia. Los datos ya están; sólo falta dar el
          cobro por bueno. */}
      {pendiente && (
        <details className="mt-3 border-t border-gold/25 pt-3">
          <summary className="cursor-pointer list-none text-xs font-semibold text-cyan-700">
            Registrar un pago recibido fuera de Stripe →
          </summary>
          <form action={marcarPagadaManual} className="mt-3 grid gap-3 sm:grid-cols-4">
            <input type="hidden" name="id" value={r.id} />
            <SelectField label="Forma de pago" name="paymentMethod" options={OPCIONES_METODO} />
            <Field label="Referencia" name="paymentRef" placeholder="Nº de operación" />
            <Field
              label="Importe USD"
              name="amount"
              type="number"
              defaultValue={BOOTCAMP.priceUSD}
            />
            <div className="flex items-end">
              <Button type="submit" size="sm">
                Marcar pagada
              </Button>
            </div>
          </form>
        </details>
      )}

      {sePuedeBorrar && (
        <div className="mt-3 flex justify-end border-t border-surface-line pt-2">
          <DeleteButton action={borrarReserva} id={r.id} />
        </div>
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
