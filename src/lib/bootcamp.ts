// Bootcamp Utah 2027 — datos del programa.
//
// El texto largo vive aquí en ES/EN (mismo patrón que INTELLIGENCES en
// constants.ts); las cadenas cortas de chrome viven en el diccionario.
//
// FECHAS DEL VIAJE: confirmadas por el usuario (llegada 27 jul, regreso 1 ago).
// Se movieron desde enero para que el día 4 caiga dentro de las puertas abiertas
// del Templo de Salt Lake, que van del 5 de abril al 1 de octubre de 2027.
// FECHAS DEL TRÁMITE: orientativas, PENDIENTES DE APROBACIÓN antes de publicar.

export const BOOTCAMP = {
  name: "Bootcamp Utah 2027",
  shortName: "Bootcamp 2027",
  /** Llegada. Utah está en MDT (UTC-6) en julio. Objetivo de la cuenta regresiva. */
  arrivalISO: "2027-07-27T00:00:00-06:00",
  returnISO: "2027-08-01T00:00:00-06:00",
  days: 4,
  nights: 5,
  /** Inscripción. Cubre la carta de invitación del participante Y de UN
      acompañante. NO incluye vuelos, hospedaje, comidas ni transporte local. */
  priceUSD: 250,
  place: "Utah, EE.UU.",
  /** Cupos anunciados. Referencia de marketing acordada con el usuario. */
  seats: 50,
  /**
   * Franja de edad admitida.
   *
   * Estaba escrita a fuego —"10 a 19"— en cuatro sitios: la validación pública,
   * la del panel, el mensaje de error y el texto de marketing. Al aceptar al
   * primer participante de 8 años hubo que cambiarla en todos, y uno se escapa
   * siempre. Aquí se cambia una vez.
   */
  edadMin: 8,
  edadMax: 19,

  /** Cierre de inscripción — el plazo que de verdad urge. */
  deadlineISO: "2027-03-31",
  deadlineEs: "31 de marzo",
  deadlineEn: "March 31",
} as const;

/**
 * Fotos de portada y cierre. `null` = se usa sólo el cielo nocturno actual.
 * Tamaños y prompts en `docs/imagenes-bootcamp.md`.
 */
export const BOOTCAMP_MEDIA = {
  /**
   * Fondo de la portada. Necesita DOS archivos, no uno recortado:
   * en escritorio la sección es muy apaisada y en móvil es vertical, así que
   * un solo apaisado recortaría al centro y se perdería la composición (el
   * titular vive en la mitad izquierda y esa zona se pide despejada).
   *
   *   src       → public/bootcamp/hero-utah.jpg        2560×1200 (apaisada)
   *   srcMobile → public/bootcamp/hero-utah-movil.jpg  1080×1440 (vertical 3:4)
   */
  hero: {
    src: "/bootcamp/hero-utah.jpg",
    srcMobile: "/bootcamp/hero-utah-movil.jpg",
    alt: "Montañas nevadas de Utah al anochecer",
  } as { src: string; srcMobile: string; alt: string } | null,
  /**
   * La foto que INVITA. Se usa donde hay que hacer que alguien se imagine allí
   * —el cuadro de acceso del feed— y por eso es una foto real con adolescentes,
   * no la ilustración de marca: chicos con mochila cruzando el campus nevado
   * con las montañas detrás. Un padre se ve a su hijo dentro de ese grupo, que
   * es exactamente lo que tiene que pasar.
   */
  invite: {
    src: "/bootcamp/dia-1-foto.jpg",
    alt: "Grupo de adolescentes con mochilas cruzando un campus nevado en Utah, con las montañas al fondo",
  } as { src: string; alt: string } | null,
  /** Banda ancha del cierre. public/bootcamp/cierre-grupo.jpg — 2400×800 */
  closing: {
    src: "/bootcamp/cierre-grupo.jpg",
    alt: "",
  } as { src: string; alt: string } | null,
};

export type BootcampLocale = "es" | "en";

type DayCopy = {
  /** Titular del día. */
  title: string;
  /** Una frase que explica por qué ese día importa. */
  lead: string;
  /** Paradas concretas del día. */
  stops: { name: string; note: string }[];
  /** Letra pequeña del día: lo que un padre debe saber antes de contar con él. */
  aviso?: string;
};

export type BootcampDay = {
  n: number;
  /**
   * DOS CAPAS, y conviven:
   *
   * `art`   → la ilustración de marca. Decorado. Si es lo único que hay, hace
   *           de imagen de la tarjeta: ya se ve bien y está lista.
   * `photo` → la foto real con adolescentes. Cuando existe, PASA AL FRENTE
   *           como imagen de la tarjeta y la ilustración se retira al fondo,
   *           muy tenue, dando ambiente sin competir.
   *
   * Un padre proyecta a su hijo en una foto, no en un dibujo; pero el dibujo
   * sostiene la atmósfera de la pieza. Por eso ninguna sustituye a la otra.
   *
   * Ambas admiten `null`: sin nada, la tarjeta se ve como hoy.
   * Tamaños en `docs/imagenes-bootcamp.md`.
   */
  art: { src: string; alt: string } | null;
  photo: { src: string; alt: string } | null;
  /** Fecha civil del día (los 4 días plenos entre llegada y regreso). */
  dateISO: string;
  dayEs: string;
  dayEn: string;
  icon: "chapters" | "store" | "star" | "events";
  /** El día 3 es el corazón del programa: se muestra con más peso. */
  hero: boolean;
  es: DayCopy;
  en: DayCopy;
};

export const BOOTCAMP_DAYS: BootcampDay[] = [
  {
    n: 1,
    dateISO: "2027-07-28",
    art: { src: "/bootcamp/dia-1-campus.jpg", alt: "Campus universitario nevado al atardecer" },
    photo: {
      src: "/bootcamp/dia-1-foto.jpg",
      alt: "Grupo de adolescentes recorriendo una avenida de campus nevada con las montañas Wasatch al fondo",
    },
    dayEs: "Miércoles 28 de julio",
    dayEn: "Wednesday, July 28",
    icon: "chapters",
    hero: false,
    es: {
      title: "Tu futuro tiene campus",
      lead: "Caminar un campus cambia lo que un adolescente cree posible. No es un paseo: es ver con sus propios ojos el aula donde podría estar en cuatro años.",
      stops: [
        {
          name: "Brigham Young University (BYU)",
          note: "Provo. Uno de los campus privados más grandes de Estados Unidos.",
        },
        {
          name: "University of Utah",
          note: "Salt Lake City. Universidad pública de investigación, cuna de startups.",
        },
      ],
    },
    en: {
      title: "Your future has a campus",
      lead: "Walking a campus changes what a teenager believes is possible. This isn't sightseeing: it's seeing the classroom they could be sitting in four years from now.",
      stops: [
        {
          name: "Brigham Young University (BYU)",
          note: "Provo. One of the largest private campuses in the United States.",
        },
        {
          name: "University of Utah",
          note: "Salt Lake City. Public research university, a startup breeding ground.",
        },
      ],
    },
  },
  {
    n: 2,
    dateISO: "2027-07-29",
    art: {
      src: "/bootcamp/dia-2-silicon-slopes.jpg",
      alt: "Corredor tecnológico al pie de montañas nevadas",
    },
    photo: {
      src: "/bootcamp/dia-2-foto.jpg",
      alt: "Adolescentes atendiendo una explicación en una oficina tecnológica con las montañas nevadas tras el ventanal",
    },
    dayEs: "Jueves 29 de julio",
    dayEn: "Thursday, July 29",
    icon: "store",
    hero: false,
    es: {
      title: "Donde se construye la tecnología",
      lead: "Utah no es solo montaña: es Silicon Slopes. Del cobre que salió de la roca al software que hoy usa el mundo entero, en un solo día.",
      stops: [
        {
          name: "Capitolio de Utah",
          note: "Salt Lake City. Dónde y cómo se toman las decisiones del estado.",
        },
        {
          name: "Mina Kennecott · Bingham Canyon",
          note: "Extracción de cobre. La excavación hecha por el hombre más grande del planeta.",
        },
        {
          name: "Adobe",
          note: "Lehi. Las herramientas con las que se diseña medio internet.",
        },
        {
          name: "Silicon Slopes",
          note: "El corredor tecnológico de Utah: Qualtrics, Domo, Podium, Lucid, Ancestry.",
        },
      ],
    },
    en: {
      title: "Where technology gets built",
      lead: "Utah isn't just mountains: it's Silicon Slopes. From the copper pulled out of the rock to the software the whole world runs on — in a single day.",
      stops: [
        {
          name: "Utah State Capitol",
          note: "Salt Lake City. Where and how the state's decisions get made.",
        },
        {
          name: "Kennecott Mine · Bingham Canyon",
          note: "Copper extraction. The largest man-made excavation on the planet.",
        },
        {
          name: "Adobe",
          note: "Lehi. The tools half the internet is designed with.",
        },
        {
          name: "Silicon Slopes",
          note: "Utah's tech corridor: Qualtrics, Domo, Podium, Lucid, Ancestry.",
        },
      ],
    },
  },
  {
    n: 3,
    dateISO: "2027-07-30",
    // 16:9 de origen. Se muestra completa en móvil y recortada a 21:9 en
    // escritorio: un 21:9 real en un teléfono son ~167 px, una rendija.
    art: {
      src: "/bootcamp/dia-3-ceremonia.jpg",
      alt: "Escenario en penumbra con un trofeo estrella bajo un haz de luz",
    },
    photo: {
      src: "/bootcamp/dia-3-foto.jpg",
      alt: "Entrega de premio a contraluz sobre el escenario, con las montañas de Utah al atardecer tras el ventanal",
    },
    dayEs: "Viernes 30 de julio",
    dayEn: "Friday, July 30",
    icon: "star",
    hero: true,
    es: {
      title: "El día GÉNESIS i7™",
      lead: "El corazón del bootcamp. Siete profesionales en la sala, uno por cada inteligencia, cara a cara con los chicos. Y al cierre, la ceremonia: el mejor proyecto Star App recibe su premio.",
      stops: [
        {
          name: "Un profesional por inteligencia",
          note: "Siete mesas, siete conversaciones reales: Espiritual, Mental, Física, Emocional, Social, Financiera y Tecnológica.",
        },
        {
          name: "Ceremonia Star App",
          note: "Se premia al mejor proyecto de la cohorte. Escenario, jurado y reconocimiento.",
        },
      ],
    },
    en: {
      title: "GÉNESIS i7™ day",
      lead: "The heart of the bootcamp. Seven professionals in the room, one per intelligence, face to face with the kids. And to close: the ceremony where the best Star App project takes the prize.",
      stops: [
        {
          name: "One professional per intelligence",
          note: "Seven tables, seven real conversations: Spiritual, Mental, Physical, Emotional, Social, Financial and Technological.",
        },
        {
          name: "Star App ceremony",
          note: "The cohort's best project is awarded. Stage, jury and recognition.",
        },
      ],
    },
  },
  {
    n: 4,
    dateISO: "2027-07-31",
    art: {
      src: "/bootcamp/dia-4-templo.jpg",
      alt: "Ilustración de un sendero entre jardines que lleva a un templo de granito iluminado al anochecer",
    },
    photo: {
      src: "/bootcamp/dia-4-templo-foto.jpg",
      alt: "Recreación de un grupo de adolescentes de espaldas caminando entre jardines hacia el Templo de Salt Lake en una mañana de verano",
    },
    dayEs: "Sábado 31 de julio",
    dayEn: "Saturday, July 31",
    icon: "events",
    hero: false,
    es: {
      title: "El Templo de Salt Lake, por dentro",
      lead: "El cierre. Un edificio de 1893 cuyo interior normalmente no está abierto al público abre sus puertas por unos meses, y los chicos lo recorren antes de volver a casa.",
      stops: [
        {
          name: "Recorrido por el Templo de Salt Lake",
          note: "Primero, el programa de puertas abiertas: cerca de una hora, con opción en español.",
        },
        {
          name: "Centro de Visitantes",
          note: "Después, sus 3.700 m² y la exhibición «Inside a Temple».",
        },
        {
          name: "Jardines de la Manzana del Templo",
          note: "Para cerrar, la arquitectura del siglo XIX y los jardines al aire libre.",
        },
      ],
      aviso:
        "Actividad sujeta a la disponibilidad de boletos. StarbizAcademy no está afiliada a La Iglesia de Jesucristo de los Santos de los Últimos Días, organizadora de las puertas abiertas.",
    },
    en: {
      title: "Inside the Salt Lake Temple",
      lead: "The finale. An 1893 building whose interior is normally closed to the public opens its doors for a few months, and the kids walk through it before heading home.",
      stops: [
        {
          name: "Salt Lake Temple tour",
          note: "First, the open house: about an hour, with a Spanish option.",
        },
        {
          name: "Visitors' Center",
          note: "Next, its 39,800 sq ft and the “Inside a Temple” exhibit.",
        },
        {
          name: "Temple Square gardens",
          note: "To close, the 19th-century architecture and the gardens outdoors.",
        },
      ],
      aviso:
        "Subject to ticket availability. StarbizAcademy is not affiliated with The Church of Jesus Christ of Latter-day Saints, which organises the open house.",
    },
  },
];

/** Qué cubre y qué no cubre la inscripción. Claridad = confianza con los padres. */
export const BOOTCAMP_INCLUDES = {
  es: {
    included: [
      "Tu cupo en el Bootcamp Utah 2027",
      "Carta de invitación oficial para el participante Y un acompañante",
      "El programa completo de los 4 días",
      "Acompañamiento del equipo StarbizAcademy durante todo el proceso",
    ],
    excluded: [
      "Vuelos internacionales",
      "Hospedaje durante las 5 noches",
      "Comidas",
      "Transporte local en Utah",
      "Tasas consulares y trámite de visa",
    ],
  },
  en: {
    included: [
      "Your seat at Bootcamp Utah 2027",
      "Official invitation letter for the participant AND one companion",
      "The full 4-day programme",
      "StarbizAcademy team support throughout the process",
    ],
    excluded: [
      "International flights",
      "Lodging for the 5 nights",
      "Meals",
      "Local transport in Utah",
      "Consular fees and visa processing",
    ],
  },
} as const;

/**
 * Línea de tiempo del trámite.
 *
 * ⚠️ FECHAS GUÍA — pendientes de aprobación del usuario antes de publicar.
 * El punto crítico es el paso 3: en varios consulados de Latinoamérica la cita
 * puede tardar meses, así que inscribirse tarde es el riesgo real del programa.
 */
export const BOOTCAMP_TIMELINE = [
  {
    step: 1,
    critical: false,
    es: {
      when: "Antes del 31 de marzo",
      title: "Inscripción",
      body: "Reservas tu cupo con los $250 — hay 50. Es el paso que activa todo lo demás.",
    },
    en: {
      when: "Before March 31",
      title: "Registration",
      body: "You reserve your seat with the $250 — there are 50. This unlocks everything else.",
    },
  },
  {
    step: 2,
    critical: false,
    es: {
      when: "Hasta 7 días después",
      title: "Dos cartas de invitación",
      body: "Emitimos la carta oficial de StarbizAcademy para tu hijo Y para un acompañante, para presentarlas en el consulado.",
    },
    en: {
      when: "Within 7 days",
      title: "Two invitation letters",
      body: "We issue the official StarbizAcademy letter for your child AND one companion, to present at the consulate.",
    },
  },
  {
    step: 3,
    critical: true,
    es: {
      when: "En cuanto tengas las cartas",
      title: "DS-160 y cita consular",
      body: "Aquí está el cuello de botella: en varios países la cita se agenda con meses de espera. Cuanto antes, mejor.",
    },
    en: {
      when: "As soon as you have the letters",
      title: "DS-160 and consular appointment",
      body: "This is the bottleneck: in several countries appointments are booked months out. The sooner the better.",
    },
  },
  {
    step: 4,
    critical: false,
    es: {
      when: "Abril – junio 2027",
      title: "Entrevista y visa",
      body: "Vas a tu entrevista con la carta de invitación y el programa del bootcamp en mano.",
    },
    en: {
      when: "April – June 2027",
      title: "Interview and visa",
      body: "You attend your interview with the invitation letter and the bootcamp programme in hand.",
    },
  },
  {
    step: 5,
    critical: false,
    es: {
      when: "Junio 2027",
      title: "Vuelos y hospedaje",
      body: "Con la visa aprobada, cierras pasajes y alojamiento. Te orientamos sobre la zona.",
    },
    en: {
      when: "June 2027",
      title: "Flights and lodging",
      body: "With the visa approved, you book tickets and accommodation. We guide you on the area.",
    },
  },
  {
    step: 6,
    critical: false,
    es: {
      when: "27 de julio de 2027",
      title: "Aterrizas en Utah",
      body: "Empiezan 4 días que tu hijo no va a olvidar.",
    },
    en: {
      when: "July 27, 2027",
      title: "You land in Utah",
      body: "Four days your child will never forget begin.",
    },
  },
];

/** Milisegundos restantes hasta la llegada. Negativo si ya pasó. */
export function msUntilBootcamp(from: number = Date.now()): number {
  return new Date(BOOTCAMP.arrivalISO).getTime() - from;
}

/** Desglose de la cuenta regresiva a partir de milisegundos. */
export function countdownParts(ms: number) {
  const clamped = Math.max(0, ms);
  const sec = Math.floor(clamped / 1000);
  return {
    days: Math.floor(sec / 86400),
    hours: Math.floor((sec % 86400) / 3600),
    minutes: Math.floor((sec % 3600) / 60),
    seconds: sec % 60,
    done: ms <= 0,
  };
}
