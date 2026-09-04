import { BOOTCAMP } from "@/lib/bootcamp";

/**
 * Los datos de la carta de invitación, en un solo sitio.
 *
 * POR QUÉ VIVEN AQUÍ Y NO EN LA PLANTILLA. Una carta consular se lee entera
 * antes de aceptarla; si la sede o el firmante están escritos a mano en el
 * componente, el día que cambien hay que buscarlos por el código y alguna
 * carta saldrá con el dato viejo. Aquí se cambian una vez.
 *
 * TODO ESTO SON HECHOS VERIFICABLES, no marketing: salen del SS-4 del IRS
 * (razón social, domicilio y miembro) y del contrato de la sede.
 */
export const EMISOR = {
  razonSocial: "STARBIZ ACADEMY, LLC",
  /** Domicilio fiscal según el formulario SS-4 presentado al IRS. */
  domicilio: "1376 N 250 W",
  ciudad: "Lehi, Utah 84043",
  pais: "United States",
  /** El teléfono que CONTESTA Starbiz. Nunca el de la sede alquilada: si un
      cónsul llama a la recepción de Kiln, allí no saben quiénes sois. */
  telefono: "+1 (385) 456-4470",
  web: "www.starbizacademy.com",
  firmante: "Jimy Henry Orellana Dominguez",
  cargo: "Member, Starbiz Academy, LLC",
} as const;

/** La sede real del programa. No es el domicilio fiscal. */
export const SEDE = {
  nombre: "Kiln Lehi",
  direccion: "2701 N Thanksgiving Way, Suite 100, Lehi, Utah 84043",
  telefono: "+1 (385) 707-5662",
} as const;

/** Fechas del programa, en el inglés que lee el cónsul. */
export const PROGRAMA = {
  nombre: BOOTCAMP.name,
  fechas: "January 26 – 31, 2027",
  descripcion:
    "a four-day program of entrepreneurship workshops, university campus visits and technology-sector visits for teenagers",
} as const;

/**
 * Parentesco → cómo se dice en la carta.
 *
 * El género importa: "is the participant's mother" frente a "father". No se
 * puede deducir del nombre, y equivocarse en una carta consular es de las
 * cosas que hacen dudar del resto del documento.
 */
export const PARENTESCO: Record<string, { es: string; en: string }> = {
  MADRE: { es: "Madre", en: "mother" },
  PADRE: { es: "Padre", en: "father" },
  TUTOR: { es: "Tutor legal", en: "legal guardian" },
  HERMANO: { es: "Hermano o hermana", en: "sibling" },
  OTRO: { es: "Otro familiar", en: "relative" },
};

export const OPCIONES_PARENTESCO = Object.entries(PARENTESCO).map(([value, v]) => ({
  value,
  label: v.es,
}));

/** Fecha en el formato que usan los documentos estadounidenses. */
export function fechaLarga(d: Date | null | undefined): string | null {
  if (!d) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/**
 * La referencia de la carta. Lleva el año, el id corto de la reserva y a quién
 * va dirigida, para que dos cartas de la misma familia no compartan número.
 * Sirve si alguien llama a verificar: con esto se encuentra la reserva.
 */
export function referencia(id: string, para: "participante" | "acompanante"): string {
  return `SBA-2027-${id.slice(-6).toUpperCase()}-${para === "participante" ? "P" : "A"}`;
}

/**
 * Qué falta para poder emitir cada carta.
 *
 * Se comprueba ANTES de imprimir, no después: una carta con un hueco a medio
 * rellenar llega al consulado y no hay vuelta atrás.
 */
export function faltaParaCarta(r: {
  participantName: string;
  participantPassport: string | null;
  nationality: string | null;
  participantBirthdate: Date | null;
  companionName: string | null;
  companionPassport: string | null;
  companionBirthdate: Date | null;
  companionRelation: string | null;
}): { participante: string[]; acompanante: string[] } {
  const participante: string[] = [];
  if (!r.participantPassport) participante.push("pasaporte del participante");
  if (!r.participantBirthdate) participante.push("fecha de nacimiento");
  if (!r.nationality) participante.push("nacionalidad");

  const acompanante: string[] = [...participante];
  if (!r.companionName) acompanante.push("nombre del acompañante");
  if (!r.companionPassport) acompanante.push("pasaporte del acompañante");
  if (!r.companionBirthdate) acompanante.push("nacimiento del acompañante");
  if (!r.companionRelation) acompanante.push("parentesco");

  return { participante, acompanante };
}
