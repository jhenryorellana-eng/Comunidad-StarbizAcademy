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
export type Destinatario = "participante" | "acompanante" | "itinerario";

/** La raíz de la referencia, común a los tres documentos de una misma reserva. */
export function referenciaBase(id: string): string {
  return `SBA-2027-${id.slice(-6).toUpperCase()}`;
}

/**
 * El itinerario NO lleva sufijo de destinatario: es un anexo que acompaña a
 * las dos cartas de la familia, así que no puede pertenecer sólo a una.
 */
export function referencia(id: string, para: Destinatario): string {
  if (para === "itinerario") return `${referenciaBase(id)}-ANNEX`;
  return `${referenciaBase(id)}-${para === "participante" ? "P" : "A"}`;
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

/**
 * El itinerario, en el inglés que lee el cónsul.
 *
 * POR QUÉ SIN HORAS. Un cónsul no busca un minuto a minuto: busca señales de
 * que el viaje es real. Instituciones con nombre y apellido —BYU, Adobe, la
 * mina de Kennecott, el Utah Olympic Park— pesan mucho más que un horario
 * inventado, y una hora falsa en un documento consular es peor que ninguna.
 *
 * Cuando Henry confirme los horarios reales del día, se añaden aquí y salen
 * en todos los itinerarios a la vez.
 *
 * TODO ESTO SALE DE `BOOTCAMP_DAYS`, que es el programa que ya se publica en
 * la web. Si algún día cambia allí, tiene que cambiar aquí: son el mismo viaje
 * contado dos veces, y contradecirse entre la web y el consulado es lo peor
 * que puede pasar.
 */
export type DiaItinerario = {
  fecha: string;
  dia: string;
  titulo: string;
  /** null en los días de vuelo: no hay programa, y fingirlo sería mentir. */
  paradas: { lugar: string; nota: string }[] | null;
};

export const ITINERARIO: DiaItinerario[] = [
  {
    fecha: "January 26, 2027",
    dia: "Tuesday",
    titulo: "Arrival in Utah",
    paradas: null,
  },
  {
    fecha: "January 27, 2027",
    dia: "Wednesday",
    titulo: "University campuses",
    paradas: [
      { lugar: "Brigham Young University (BYU)", nota: "Provo — one of the largest private campuses in the United States" },
      { lugar: "University of Utah", nota: "Salt Lake City — public research university" },
      { lugar: "American Fork High School", nota: "A regular school day in Utah, from the inside" },
    ],
  },
  {
    fecha: "January 28, 2027",
    dia: "Thursday",
    titulo: "Industry and government",
    paradas: [
      { lugar: "Utah State Capitol", nota: "Salt Lake City — how the state's decisions are made" },
      { lugar: "Kennecott Copper Mine · Bingham Canyon", nota: "The largest man-made excavation in the world" },
      { lugar: "Adobe", nota: "Lehi — the tools half the internet is designed with" },
      { lugar: "Silicon Slopes", nota: "Utah's technology corridor: Qualtrics, Domo, Podium, Lucid, Ancestry" },
    ],
  },
  {
    fecha: "January 29, 2027",
    dia: "Friday",
    titulo: "Workshop day and closing ceremony",
    paradas: [
      { lugar: "Kiln Lehi — 2701 N Thanksgiving Way, Suite 100", nota: "Seven professional mentors, one per discipline, in working sessions with the participants" },
      { lugar: "Star App ceremony", nota: "The cohort's best project is recognised" },
    ],
  },
  {
    fecha: "January 30, 2027",
    dia: "Saturday",
    titulo: "Utah in winter",
    paradas: [
      { lugar: "Park City", nota: "Historic Main Street and the surrounding mountains" },
      { lugar: "Utah Olympic Park", nota: "Facilities of the Salt Lake 2002 Winter Olympics" },
      { lugar: "Temple Square", nota: "Salt Lake City — the historic centre" },
    ],
  },
  {
    fecha: "January 31, 2027",
    dia: "Sunday",
    titulo: "Departure — return to country of residence",
    paradas: null,
  },
];
