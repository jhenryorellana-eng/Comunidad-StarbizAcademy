/**
 * Países del público del bootcamp.
 *
 * POR QUÉ ESTO ES UNA LISTA Y NO UN CAMPO DE TEXTO. La nacionalidad se imprime
 * literalmente en la carta de invitación que revisa el consulado. Escrita a
 * mano, el mismo país llega como "Peruana", "Perú", "peruano" o "PERUANA", y
 * alguien tiene que normalizar esa columna a mano antes de emitir cincuenta
 * documentos. Elegir de una lista lo resuelve en el origen.
 *
 * SE GUARDA EL GENTILICIO, no el nombre del país: es la forma que va en la
 * carta ("de nacionalidad Peruana"), y es lo que ya hay en las filas antiguas,
 * así que no rompe nada de lo guardado hasta ahora.
 *
 * El prefijo telefónico viaja aquí para rellenar solo el campo de WhatsApp en
 * cuanto se elige país — un dato menos que teclear en un formulario de once.
 */
export type Pais = {
  /** ISO 3166-1 alfa-2. Se usa como distintivo visual y como clave estable. */
  iso: string;
  nombre: string;
  /** Lo que se guarda y lo que se imprime. */
  gentilicio: string;
  /** Prefijo telefónico internacional. */
  prefijo: string;
  /**
   * De donde viene casi todo el grupo. Estos seis van arriba del todo; el
   * resto queda detrás del buscador, que es donde estorba menos.
   */
  frecuente?: boolean;
};

export const PAISES: Pais[] = [
  { iso: "PE", nombre: "Perú", gentilicio: "Peruana", prefijo: "+51", frecuente: true },
  { iso: "CO", nombre: "Colombia", gentilicio: "Colombiana", prefijo: "+57", frecuente: true },
  { iso: "EC", nombre: "Ecuador", gentilicio: "Ecuatoriana", prefijo: "+593", frecuente: true },
  { iso: "MX", nombre: "México", gentilicio: "Mexicana", prefijo: "+52", frecuente: true },
  { iso: "BO", nombre: "Bolivia", gentilicio: "Boliviana", prefijo: "+591", frecuente: true },
  { iso: "CL", nombre: "Chile", gentilicio: "Chilena", prefijo: "+56", frecuente: true },

  { iso: "AR", nombre: "Argentina", gentilicio: "Argentina", prefijo: "+54" },
  { iso: "BR", nombre: "Brasil", gentilicio: "Brasileña", prefijo: "+55" },
  { iso: "CR", nombre: "Costa Rica", gentilicio: "Costarricense", prefijo: "+506" },
  { iso: "CU", nombre: "Cuba", gentilicio: "Cubana", prefijo: "+53" },
  { iso: "DO", nombre: "República Dominicana", gentilicio: "Dominicana", prefijo: "+1" },
  { iso: "SV", nombre: "El Salvador", gentilicio: "Salvadoreña", prefijo: "+503" },
  { iso: "ES", nombre: "España", gentilicio: "Española", prefijo: "+34" },
  { iso: "US", nombre: "Estados Unidos", gentilicio: "Estadounidense", prefijo: "+1" },
  { iso: "GT", nombre: "Guatemala", gentilicio: "Guatemalteca", prefijo: "+502" },
  { iso: "HN", nombre: "Honduras", gentilicio: "Hondureña", prefijo: "+504" },
  { iso: "NI", nombre: "Nicaragua", gentilicio: "Nicaragüense", prefijo: "+505" },
  { iso: "PA", nombre: "Panamá", gentilicio: "Panameña", prefijo: "+507" },
  { iso: "PY", nombre: "Paraguay", gentilicio: "Paraguaya", prefijo: "+595" },
  { iso: "PR", nombre: "Puerto Rico", gentilicio: "Puertorriqueña", prefijo: "+1" },
  { iso: "UY", nombre: "Uruguay", gentilicio: "Uruguaya", prefijo: "+598" },
  { iso: "VE", nombre: "Venezuela", gentilicio: "Venezolana", prefijo: "+58" },
];

export const PAISES_FRECUENTES = PAISES.filter((p) => p.frecuente);
export const PAISES_RESTO = PAISES.filter((p) => !p.frecuente);

/** Sin tildes y en minúsculas: "peru" encuentra "Perú", y "mexico" a "México". */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Busca por nombre, gentilicio o código. Devuelve los frecuentes primero
 * cuando la consulta está vacía; con consulta, el orden natural de la lista.
 */
export function buscarPaises(consulta: string): Pais[] {
  const q = normalizar(consulta.trim());
  if (!q) return PAISES;
  return PAISES.filter(
    (p) =>
      normalizar(p.nombre).includes(q) ||
      normalizar(p.gentilicio).includes(q) ||
      p.iso.toLowerCase() === q,
  );
}

/** Recupera el país a partir de lo guardado, que es el gentilicio. */
export function paisPorGentilicio(gentilicio: string | null | undefined): Pais | null {
  if (!gentilicio) return null;
  const g = normalizar(gentilicio);
  return PAISES.find((p) => normalizar(p.gentilicio) === g) ?? null;
}
