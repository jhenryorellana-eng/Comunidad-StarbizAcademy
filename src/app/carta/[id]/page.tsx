import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  EMISOR,
  SEDE,
  PROGRAMA,
  PARENTESCO,
  fechaLarga,
  referencia,
  faltaParaCarta,
} from "@/lib/carta";
import { BotonImprimir } from "@/components/admin/BotonImprimir";

export const metadata: Metadata = {
  title: "Carta de invitación",
  robots: { index: false, follow: false },
};

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ para?: string }>;
};

/**
 * La carta de invitación, lista para imprimir.
 *
 * VIVE FUERA DE `/admin` A PROPÓSITO. Bajo `/admin` heredaría la barra lateral
 * y la cabecera del panel, y al imprimir habría que pelearse con CSS para
 * esconderlas. Aquí la página es sólo la carta. El control de acceso es el
 * mismo —sigue siendo sólo para administradores—, sólo cambia el envoltorio.
 *
 * SE IMPRIME DESDE EL NAVEGADOR (Ctrl+P → Guardar como PDF). Se evaluó generar
 * el PDF en el servidor, pero eso obliga a meter un navegador headless en el
 * despliegue: decenas de megas en una función serverless para producir un
 * documento de una página que alguien va a revisar de todos modos antes de
 * enviarlo.
 */
export default async function CartaPage({ params, searchParams }: Params) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const { para: paraRaw } = await searchParams;
  const para = paraRaw === "acompanante" ? "acompanante" : "participante";

  const r = await prisma.bootcampRegistration.findUnique({ where: { id } });
  if (!r) notFound();

  const falta = faltaParaCarta(r)[para];
  const parentesco = r.companionRelation ? PARENTESCO[r.companionRelation] : null;
  const hoy = fechaLarga(new Date());

  const esAcompanante = para === "acompanante";
  const titular = esAcompanante ? r.companionName : r.participantName;

  return (
    <>
      {/* ── Barra de control. No se imprime. ─────────────────────────────── */}
      <div className="no-print border-b border-surface-line bg-surface px-6 py-3 print:hidden">
        <div className="mx-auto flex max-w-[8.5in] flex-wrap items-center gap-3">
          <Link
            href={`/admin/bootcamp/${r.id}`}
            className="text-sm font-semibold text-cyan-700 hover:text-cyan"
          >
            ← Volver a la reserva
          </Link>

          <span className="ml-auto flex items-center gap-2">
            <Link
              href={`/carta/${r.id}?para=participante`}
              className={
                para === "participante"
                  ? "rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-surface-line bg-paper px-3 py-1.5 text-xs font-semibold text-navy hover:border-cyan"
              }
            >
              Participante
            </Link>
            <Link
              href={`/carta/${r.id}?para=acompanante`}
              className={
                esAcompanante
                  ? "rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-surface-line bg-paper px-3 py-1.5 text-xs font-semibold text-navy hover:border-cyan"
              }
            >
              Acompañante
            </Link>
            <BotonImprimir />
          </span>
        </div>

        {falta.length > 0 && (
          <div className="mx-auto mt-3 max-w-[8.5in] rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm font-semibold text-rose-700">
              No imprimas esta carta todavía — faltan datos
            </p>
            <p className="mt-1 text-sm text-rose-700">
              {falta.join(" · ")}. Los huecos salen marcados en rojo abajo.{" "}
              <Link
                href={`/admin/bootcamp/${r.id}`}
                className="font-semibold underline underline-offset-2"
              >
                Completar
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* ── LA CARTA ─────────────────────────────────────────────────────── */}
      <article className="carta mx-auto my-8 max-w-[8.5in] bg-white px-[0.9in] py-[0.85in] text-[10.6pt] leading-[1.5] text-navy shadow-[0_2px_20px_rgba(26,39,68,0.12)] print:my-0 print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-2 border-navy pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Starbiz Academy" className="h-[54px] w-auto" />
          <div className="text-right text-[9pt] leading-[1.45] text-ink">
            <b className="mb-0.5 block font-display text-[11pt] tracking-[0.06em] text-navy">
              {EMISOR.razonSocial}
            </b>
            {EMISOR.domicilio} · {EMISOR.ciudad} · {EMISOR.pais}
            <br />
            Tel. {EMISOR.telefono} · {EMISOR.web}
          </div>
        </header>

        <div className="mt-5 flex justify-between text-[9.5pt] text-ink">
          <span>
            {EMISOR.ciudad.split(",")[0]}, Utah — {hoy}
          </span>
          <span>Ref. {referencia(r.id, para)}</span>
        </div>

        <div className="mt-4">
          <p className="m-0 font-bold">To Whom It May Concern</p>
          <p className="m-0">Consular Section, U.S. Embassy</p>
        </div>

        <p className="mt-4 border-l-[3px] border-gold-700 bg-cream px-3 py-2 font-display text-[11pt] font-bold">
          RE: Letter of Invitation — {PROGRAMA.nombre}
        </p>

        <p className="mt-4">Dear Consular Officer,</p>
        <p className="mt-2.5 text-justify">
          {EMISOR.razonSocial.replace(", LLC", ", LLC")}, a limited liability company organized
          under the laws of the State of Utah, hereby confirms the following in support of the
          visitor visa application of{" "}
          <Dato v={titular} falta="NOMBRE PENDIENTE" fuerte />.
        </p>

        {/* 1 · Quién está inscrito */}
        <h3 className="mt-4 font-display text-[10.6pt] font-bold">1. Enrollment</h3>
        <p className="mt-1 text-justify">
          <Dato v={r.participantName} falta="NOMBRE PENDIENTE" fuerte mayus />, a{" "}
          <Dato v={gentilicioEn(r.nationality)} falta="NACIONALIDAD PENDIENTE" /> national born on{" "}
          <Dato v={fechaLarga(r.participantBirthdate)} falta="NACIMIENTO PENDIENTE" /> (Passport
          No. <Dato v={r.participantPassport} falta="PASAPORTE PENDIENTE" fuerte />
          {r.documentId ? <>, National ID No. {r.documentId}</> : null}), is enrolled in{" "}
          <b>{PROGRAMA.nombre}</b>, {PROGRAMA.descripcion}, organized by our company.
          {r.paidAt ? (
            <>
              {" "}
              The registration was <b>paid in full on {fechaLarga(r.paidAt)}</b>.
            </>
          ) : null}
        </p>

        <div className="my-2.5 rounded-md border-[1.5px] border-gold-700 bg-[#fdf8f0] px-3.5 py-2.5">
          <table className="border-collapse text-[10pt]">
            <tbody>
              <Fila k="Program" v={PROGRAMA.nombre} fuerte />
              <Fila k="Dates" v={PROGRAMA.fechas} fuerte />
              <Fila
                k="Venue"
                v={`${SEDE.nombre} — ${SEDE.direccion} · Tel. ${SEDE.telefono}`}
              />
            </tbody>
          </table>
        </div>

        {/* La frase que mantiene el viaje dentro de la visa de visitante: un
            curso que diera crédito académico exigiría visa de estudiante. */}
        <p className="text-justify">
          The program is a short, non-credit recreational course. It does not lead to any degree,
          academic credit or certificate.
        </p>

        {/* 2 · El acompañante */}
        <h3 className="mt-4 font-display text-[10.6pt] font-bold">
          2. {esAcompanante ? "The invited visitor" : "Accompanying adult"}
        </h3>
        <p className="mt-1 text-justify">
          <Dato v={r.companionName} falta="ACOMPAÑANTE PENDIENTE" fuerte mayus />, a{" "}
          <Dato v={gentilicioEn(r.nationality)} falta="NACIONALIDAD PENDIENTE" /> national born on{" "}
          <Dato v={fechaLarga(r.companionBirthdate)} falta="NACIMIENTO PENDIENTE" /> (Passport No.{" "}
          <Dato v={r.companionPassport} falta="PASAPORTE PENDIENTE" fuerte />
          {r.companionDocumentId ? <>, National ID No. {r.companionDocumentId}</> : null}), is the
          participant&rsquo;s <Dato v={parentesco?.en} falta="PARENTESCO PENDIENTE" /> and{" "}
          <b>registered accompanying adult</b> for the program.
          {esAcompanante ? (
            <> This letter is issued in support of that person&rsquo;s visa application.</>
          ) : null}
        </p>

        {/* 3 · Gastos y regreso — lo que hace que la carta sume */}
        <h3 className="mt-4 font-display text-[10.6pt] font-bold">3. Expenses and return</h3>
        <p className="mt-1 text-justify">
          {EMISOR.razonSocial} does not sponsor or finance the travel, lodging, meals or any other
          expense of the persons named herein; all costs are borne by the family. They reside in{" "}
          <Dato v={r.residence} falta="RESIDENCIA PENDIENTE" />, where they maintain their home and
          family ties, and are expected to return at the end of the program on{" "}
          <b>January 31, 2027</b>.
        </p>

        <p className="mt-2.5 text-justify">
          We remain available to verify the information contained in this letter at the contact
          details above.
        </p>
        <p className="mt-2.5">Sincerely,</p>

        <div className="mt-8">
          <div className="h-[42px] w-[250px] border-b border-navy" />
          <b className="mt-1.5 block">{EMISOR.firmante}</b>
          <span className="block text-[9.5pt] text-ink">{EMISOR.cargo}</span>
        </div>

        <footer className="mt-10 border-t border-line pt-1.5 text-[8pt] text-muted">
          {EMISOR.razonSocial} · Utah limited liability company · This letter is issued at the
          request of the family named herein and may be verified by contacting the company directly.
        </footer>
      </article>

      <style>{`
        @page { size: Letter; margin: 0.85in 0.9in 0.8in 0.9in; }
        @media print {
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  );
}

/** Un dato que puede faltar. Si falta, sale en rojo y a la vista: una carta con
    un hueco silencioso llega al consulado y no hay vuelta atrás. */
function Dato({
  v,
  falta,
  fuerte,
  mayus,
}: {
  v: string | null | undefined;
  falta: string;
  fuerte?: boolean;
  mayus?: boolean;
}) {
  if (!v) {
    return (
      <span className="rounded bg-rose-100 px-1 font-bold text-rose-700 print:bg-rose-100">
        [{falta}]
      </span>
    );
  }
  const texto = mayus ? v.toUpperCase() : v;
  return fuerte ? <b className="tracking-[0.02em]">{texto}</b> : <>{texto}</>;
}

function Fila({ k, v, fuerte }: { k: string; v: string; fuerte?: boolean }) {
  return (
    <tr>
      <td className="whitespace-nowrap py-0.5 pr-3 align-top text-muted">{k}</td>
      <td className={fuerte ? "py-0.5 align-top font-bold" : "py-0.5 align-top"}>{v}</td>
    </tr>
  );
}

/**
 * El gentilicio guardado está en español ("Peruana") y la carta va en inglés.
 * Se traduce sólo lo que hace falta; si aparece un país nuevo, se devuelve tal
 * cual antes que inventar una traducción.
 */
function gentilicioEn(g: string | null): string | null {
  if (!g) return null;
  const mapa: Record<string, string> = {
    Peruana: "Peruvian",
    Colombiana: "Colombian",
    Ecuatoriana: "Ecuadorian",
    Mexicana: "Mexican",
    Boliviana: "Bolivian",
    Chilena: "Chilean",
    Argentina: "Argentine",
    Brasileña: "Brazilian",
    Costarricense: "Costa Rican",
    Cubana: "Cuban",
    Dominicana: "Dominican",
    Salvadoreña: "Salvadoran",
    Española: "Spanish",
    Estadounidense: "American",
    Guatemalteca: "Guatemalan",
    Hondureña: "Honduran",
    Nicaragüense: "Nicaraguan",
    Panameña: "Panamanian",
    Paraguaya: "Paraguayan",
    Puertorriqueña: "Puerto Rican",
    Uruguaya: "Uruguayan",
    Venezolana: "Venezuelan",
  };
  return mapa[g] ?? g;
}
