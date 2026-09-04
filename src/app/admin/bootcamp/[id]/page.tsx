import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageTitle, Field, SelectField, TextareaField } from "@/components/admin/ui";
import { Badge, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatDateTime } from "@/lib/format";
import { PAISES } from "@/lib/paises";
import { OPCIONES_PARENTESCO, faltaParaCarta } from "@/lib/carta";
import { editarReserva, marcarCartasEmitidas } from "../../actions";

export const metadata: Metadata = { title: "Reserva — Bootcamp Utah 2027" };

type Params = { params: Promise<{ id: string }> };

/**
 * Una reserva, con todo lo que hace falta para emitir sus dos cartas.
 *
 * ESTA PANTALLA EXISTE PORQUE LOS DATOS LLEGAN TARDE Y A TROZOS. El día que se
 * paga casi nunca está el pasaporte —se tramita después— y del acompañante hay
 * un nombre y poco más; el resto llega semanas después por WhatsApp. Sin un
 * sitio donde anotarlo, cada carta obliga a rebuscar en la conversación.
 */
export default async function ReservaDetalle({ params }: Params) {
  const { id } = await params;
  const r = await prisma.bootcampRegistration.findUnique({ where: { id } });
  if (!r) notFound();

  const falta = faltaParaCarta(r);
  const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

  return (
    <div>
      <Link
        href="/admin/bootcamp"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-navy"
      >
        <Icon name="arrowRight" size={12} className="rotate-180" />
        Todas las reservas
      </Link>

      <PageTitle>{r.participantName}</PageTitle>

      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-2">
        {r.status === "PAID" && <Badge tone="green">Pagado</Badge>}
        {r.status === "PENDING" && <Badge tone="live">Sin pagar</Badge>}
        {r.status === "REFUNDED" && <Badge tone="neutral">Reembolsada</Badge>}
        {r.paymentMethod !== "STRIPE" && <Badge tone="navy">{r.paymentMethod}</Badge>}
        {r.lettersIssuedAt && <Badge tone="cyan">Cartas emitidas</Badge>}
        <span className="text-xs text-muted">
          Alta {formatDateTime(r.createdAt, "es")}
          {r.paidAt && ` · pagado ${formatDateTime(r.paidAt, "es")}`}
        </span>
      </div>

      {/* ── LAS CARTAS ────────────────────────────────────────────────────
          Arriba del todo porque es a lo que se viene: el resto de la pantalla
          existe para que estas dos salgan bien. */}
      <section className="mb-7 rounded-2xl border border-cyan/25 bg-cyan-50/50 p-5">
        <h2 className="font-display text-base font-bold text-navy">Cartas de invitación</h2>
        <p className="mt-1 text-sm text-muted">
          Cada cupo pagado son dos: una para {r.participantName.split(" ")[0]} y otra para su
          acompañante. Se abren, se revisan y se guardan como PDF desde el navegador.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <TarjetaCarta
            id={r.id}
            para="participante"
            titulo="Participante"
            quien={r.participantName}
            falta={falta.participante}
          />
          <TarjetaCarta
            id={r.id}
            para="acompanante"
            titulo="Acompañante"
            quien={r.companionName}
            falta={falta.acompanante}
          />
        </div>

        <form action={marcarCartasEmitidas} className="mt-4 flex items-center gap-3">
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="emitidas" value={r.lettersIssuedAt ? "si" : "no"} />
          <Button type="submit" size="sm" variant={r.lettersIssuedAt ? "ghost" : "primary"}>
            {r.lettersIssuedAt ? "Desmarcar como emitidas" : "Marcar cartas como emitidas"}
          </Button>
          {r.lettersIssuedAt && (
            <span className="text-xs text-muted">
              Emitidas el {formatDateTime(r.lettersIssuedAt, "es")}
            </span>
          )}
        </form>
      </section>

      {/* ── EDICIÓN ──────────────────────────────────────────────────────── */}
      <form action={editarReserva} className="rounded-2xl border border-surface-line bg-paper p-6">
        <input type="hidden" name="id" value={r.id} />

        <Seccion titulo="Quién viaja" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" name="participantName" defaultValue={r.participantName} required span />
          <Field label="Fecha de nacimiento" name="participantBirthdate" type="date" defaultValue={iso(r.participantBirthdate)} />
          <SelectField
            label="Nacionalidad"
            name="nationality"
            defaultValue={r.nationality ?? ""}
            options={[{ value: "", label: "—" }, ...PAISES.map((p) => ({ value: p.gentilicio, label: `${p.nombre} · ${p.gentilicio}` }))]}
          />
          <Field label="DNI o documento nacional" name="documentId" defaultValue={r.documentId ?? ""} />
          <Field label="Número de pasaporte" name="participantPassport" defaultValue={r.participantPassport ?? ""} placeholder="El que va en la carta" />
          <SelectField
            label="Nivel académico"
            name="academicLevel"
            defaultValue={r.academicLevel ?? ""}
            options={[
              { value: "", label: "—" },
              { value: "PRIMARIA", label: "Primaria" },
              { value: "SECUNDARIA", label: "Secundaria" },
            ]}
          />
          <Field label="Dirección actual" name="address" defaultValue={r.address ?? ""} span />
          <Field label="Ciudad y país de residencia" name="residence" defaultValue={r.residence ?? ""} placeholder="Lima, Perú" span />
        </div>

        <Seccion titulo="El acompañante" nota="Su carta va incluida en el precio, y una carta necesita bastante más que un nombre." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" name="companionName" defaultValue={r.companionName ?? ""} span />
          <SelectField
            label="Parentesco"
            name="companionRelation"
            defaultValue={r.companionRelation ?? ""}
            options={[{ value: "", label: "—" }, ...OPCIONES_PARENTESCO]}
          />
          <Field label="Fecha de nacimiento" name="companionBirthdate" type="date" defaultValue={iso(r.companionBirthdate)} />
          <Field label="Número de pasaporte" name="companionPassport" defaultValue={r.companionPassport ?? ""} />
          <Field label="DNI o documento nacional" name="companionDocumentId" defaultValue={r.companionDocumentId ?? ""} />
        </div>

        <Seccion titulo="Contacto" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Padre, madre o tutor" name="payerName" defaultValue={r.payerName ?? ""} />
          <Field label="Correo electrónico" name="email" type="email" defaultValue={r.email} required />
          <Field label="Teléfono" name="phone" defaultValue={r.phone ?? ""} />
          <TextareaField label="Notas" name="notes" rows={2} />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit" size="sm">
            Guardar cambios
          </Button>
          {r.notes && <span className="text-xs text-muted">Nota actual: {r.notes}</span>}
        </div>
      </form>
    </div>
  );
}

function Seccion({ titulo, nota }: { titulo: string; nota?: string }) {
  return (
    <div className="mb-3 mt-7 first:mt-0">
      <p className="font-display text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
        {titulo}
      </p>
      {nota && <p className="mt-1 text-xs text-muted">{nota}</p>}
    </div>
  );
}

/** Cada carta dice si se puede emitir o qué le falta. Comprobarlo ANTES de
    imprimir es la diferencia entre corregir un dato y recuperar un documento
    que ya está en manos de la familia. */
function TarjetaCarta({
  id,
  para,
  titulo,
  quien,
  falta,
}: {
  id: string;
  para: "participante" | "acompanante";
  titulo: string;
  quien: string | null;
  falta: string[];
}) {
  const lista = falta.length > 0;
  return (
    <div
      className={
        lista
          ? "rounded-xl border border-gold/45 bg-gold/[0.06] p-4"
          : "rounded-xl border border-surface-line bg-paper p-4"
      }
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-sm font-bold text-navy">{titulo}</p>
        {!lista && <Badge tone="green">Lista</Badge>}
      </div>
      <p className="mt-0.5 truncate text-xs text-muted">{quien || "sin nombre todavía"}</p>

      {lista ? (
        <p className="mt-2.5 text-xs leading-snug text-gold-700">Falta: {falta.join(", ")}</p>
      ) : (
        <p className="mt-2.5 text-xs leading-snug text-muted">
          Todos los datos están. Se puede emitir.
        </p>
      )}

      <Link
        href={`/carta/${id}?para=${para}`}
        target="_blank"
        className="mt-3 inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-navy px-4 text-xs font-semibold text-white transition-colors hover:bg-navy-800"
      >
        {lista ? "Ver borrador" : "Abrir carta"}
        <Icon name="external" size={11} />
      </Link>
    </div>
  );
}
