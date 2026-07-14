import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const now = new Date();
const DAY = 86_400_000;
function at(daysFromNow: number, hour = 18, min = 0): Date {
  const d = new Date(now.getTime() + daysFromNow * DAY);
  d.setHours(hour, min, 0, 0);
  return d;
}
const pw = (s: string) => bcrypt.hashSync(s, 10);

// Admin credentials are configurable for production via env vars.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@starbizacademy.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "starbiz123";

async function main() {
  console.log("Resetting database…");
  // delete in dependency order
  await prisma.report.deleteMany();
  await prisma.chapterUpdate.deleteMany();
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.rsvp.deleteMany();
  await prisma.event.deleteMany();
  await prisma.podcastEpisode.deleteMany();
  await prisma.observatoryPost.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.country.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users…");
  await prisma.user.create({
    data: {
      name: "Equipo StarbizAcademy",
      email: ADMIN_EMAIL,
      building: "StarbizAcademy",
      parentalConsent: true,
      passwordHash: pw(ADMIN_PASSWORD),
      role: "ADMIN",
      country: "EE.UU.",
      bio: "Equipo fundador de StarbizAcademy.",
    },
  });

  const mateo = await prisma.user.create({
    data: {
      name: "Mateo Salazar",
      email: "mateo@example.com",
      building: "Plantillas digitales para pymes",
      parentalConsent: true,
      passwordHash: pw("password123"),
      role: "MEMBER",
      country: "EE.UU.",
      locale: "es",
      bio: "CEO Junior · Cohorte Provo. Construyendo mi primer producto digital con StarEduca.",
    },
  });
  const valentina = await prisma.user.create({
    data: {
      name: "Valentina Cruz",
      email: "valentina@example.com",
      building: "Mi primer curso de repostería online",
      parentalConsent: true,
      passwordHash: pw("password123"),
      role: "MEMBER",
      country: "EE.UU.",
      locale: "es",
      bio: "Fan de StarBooks. Analizando el caso Tesla en StarEmpresa.",
    },
  });
  const ana = await prisma.user.create({
    data: {
      name: "Ana Lucía Mendoza",
      email: "ana@example.com",
      building: "Mentora de la Cohorte Provo",
      parentalConsent: true,
      passwordHash: pw("password123"),
      role: "MENTOR",
      country: "EE.UU.",
      locale: "es",
      bio: "Mentora GÉNESIS i7™. Emprendedora digital.",
    },
  });
  const roberto = await prisma.user.create({
    data: {
      name: "Roberto Salazar",
      email: "roberto@example.com",
      building: "Aprendiendo inglés con mi hijo",
      parentalConsent: true,
      passwordHash: pw("password123"),
      role: "PARENT",
      country: "EE.UU.",
      locale: "es",
      bio: "Papá de Mateo · Padres 3.0. Aprendiendo inglés con English Together.",
    },
  });
  const diego = await prisma.user.create({
    data: {
      name: "Diego Quispe",
      email: "diego@example.com",
      building: "Explorando mi primera idea",
      parentalConsent: true,
      passwordHash: pw("password123"),
      role: "MEMBER",
      country: "Perú",
      locale: "es",
    },
  });

  // Registro parental: Roberto (Padres 3.0) dio de alta a su hijo Mateo.
  await prisma.user.update({
    where: { id: mateo.id },
    data: { parentId: roberto.id, birthdate: new Date("2011-04-12T00:00:00Z") },
  });

  console.log("Seeding countries & cohorts…");
  const usa = await prisma.country.create({
    data: { name: "Estados Unidos", code: "US", flag: "🇺🇸" },
  });
  const peru = await prisma.country.create({
    data: { name: "Perú", code: "PE", flag: "🇵🇪" },
  });
  const mexico = await prisma.country.create({
    data: { name: "México", code: "MX", flag: "🇲🇽" },
  });

  const provo = await prisma.chapter.create({
    data: {
      countryId: usa.id,
      city: "Provo",
      name: "Cohorte Provo",
      slug: "provo",
      stake: "Comunidad latina de Utah Valley",
      cohortSize: 25,
      currentWeek: 3,
      status: "ACTIVE",
      mentorName: "Ana Lucía Mendoza",
      startsAt: at(-14),
      story:
        "25 adolescentes recorriendo las 7 inteligencias de GÉNESIS i7™. Los primeros productos digitales ya están en marcha.",
    },
  });

  await prisma.chapter.create({
    data: {
      countryId: peru.id,
      city: "Lima",
      name: "Cohorte Lima",
      slug: "lima",
      cohortSize: 30,
      currentWeek: 0,
      status: "RECRUITING",
    },
  });
  await prisma.chapter.create({
    data: {
      countryId: mexico.id,
      city: "Monterrey",
      name: "Cohorte Monterrey",
      slug: "monterrey",
      cohortSize: 30,
      currentWeek: 0,
      status: "RECRUITING",
    },
  });

  console.log("Seeding cohort updates…");
  await prisma.chapterUpdate.createMany({
    data: [
      {
        chapterId: provo.id,
        week: 1,
        title: "Semana 1 — Inteligencia Espiritual",
        body: "Todo comienza aquí. Cada estudiante definió su propósito y el porqué detrás de su futuro liderazgo. Una primera sesión llena de energía.",
        photos: "[]",
        createdAt: at(-12),
      },
      {
        chapterId: provo.id,
        week: 2,
        title: "Semana 2 — Inteligencia Mental",
        body: "Cultivamos el pensamiento: primer análisis de caso en StarEmpresa. Los equipos desarmaron el modelo de negocio de Amazon.",
        photos: "[]",
        createdAt: at(-5),
      },
      {
        chapterId: provo.id,
        week: 3,
        title: "Semana 3 — Inteligencia Física y primeras ideas",
        body: "El cuerpo importa: hábitos de energía y enfoque. Además, cada estudiante bocetó su primer producto digital en StarEduca.",
        photos: "[]",
        createdAt: at(-1),
      },
    ],
  });

  console.log("Seeding events…");
  await prisma.event.create({
    data: {
      title: "Reunión semanal de la Comunidad",
      slug: "reunion-semanal-comunidad",
      description:
        "El encuentro abierto y gratuito donde vive el ecosistema. Familias y jóvenes conectan, comparten avances y conocen GÉNESIS i7™.",
      startsAt: at(0, 19),
      endsAt: at(0, 20, 30),
      isOnline: true,
      location: "Zoom · En línea",
      host: "StarbizAcademy",
      category: "WEEKLY",
      price: "Free",
      status: "LIVE",
      featured: true,
    },
  });
  await prisma.event.createMany({
    data: [
      {
        title: "Taller StarEmpresa: el caso Tesla",
        slug: "taller-starempresa-tesla",
        description:
          "Un taller práctico con metodología del caso de Harvard: cómo piensa una empresa que cambió una industria entera.",
        startsAt: at(5, 18),
        endsAt: at(5, 19, 30),
        isOnline: true,
        location: "Zoom · En línea",
        host: "Ana Lucía Mendoza",
        category: "WORKSHOP",
        price: "Free",
        status: "UPCOMING",
      },
      {
        title: "Demo Day — Cohorte Provo",
        slug: "demo-day-provo",
        description:
          "Los CEO Junior de la Cohorte Provo presentan los productos digitales que construyeron durante el programa.",
        startsAt: at(10, 17),
        endsAt: at(10, 19),
        isOnline: false,
        location: "Provo, Utah",
        host: "StarbizAcademy",
        category: "CHAPTER",
        price: "Free",
        status: "UPCOMING",
      },
      {
        title: "Conferencia Padres 3.0: reconecta con tu adolescente",
        slug: "conferencia-padres-30",
        description:
          "Henry Orellana en vivo: herramientas de crianza moderna para guiar sin conflictos en la era digital.",
        startsAt: at(7, 19),
        endsAt: at(7, 20, 30),
        isOnline: false,
        location: "Salt Lake City, Utah",
        host: "Henry Orellana D.",
        category: "SUMMIT",
        price: "Free",
        status: "UPCOMING",
      },
      {
        title: "Kickoff — Cohorte Provo",
        slug: "kickoff-provo",
        description:
          "El arranque oficial de la cohorte piloto con 25 adolescentes de Utah Valley.",
        startsAt: at(-14, 17),
        endsAt: at(-14, 19),
        isOnline: false,
        location: "Provo, Utah",
        host: "StarbizAcademy",
        category: "CHAPTER",
        price: "Free",
        status: "PAST",
      },
    ],
  });

  console.log("Seeding StarVoice…");
  await prisma.podcastEpisode.createMany({
    data: [
      {
        title: "Todo comienza con la Inteligencia Espiritual",
        slug: "inteligencia-espiritual",
        guest: "Henry Orellana D.",
        description:
          "Abrimos la temporada con el corazón de GÉNESIS i7™: la vida tiene sentido y propósito, y de ahí nace todo lo demás.",
        duration: "12 min",
        series: "Combustible Diario",
        episode: 1,
        publishedAt: at(-20),
      },
      {
        title: "El diferencial Harvard: pensar como CEO a los 15",
        slug: "diferencial-harvard",
        guest: "Ana Lucía Mendoza",
        description:
          "Por qué analizar empresas reales como Amazon o Apple instala una mentalidad que ninguna clase tradicional logra.",
        duration: "15 min",
        series: "Combustible Diario",
        episode: 2,
        publishedAt: at(-13),
      },
      {
        title: "Referentes de altura, no influencers vacíos",
        slug: "referentes-de-altura",
        guest: "Equipo StarLíderes",
        description:
          "La psicología y la perseverancia de líderes que cambiaron el mundo, contadas para la Gen Z.",
        duration: "14 min",
        series: "Combustible Diario",
        episode: 3,
        publishedAt: at(-6),
      },
      {
        title: "Padres 3.0: el ejemplo arrastra más que la palabra",
        slug: "el-ejemplo-arrastra",
        guest: "Roberto Salazar",
        description:
          "Un papá del programa cuenta cómo aprender inglés a la par de su hijo transformó la relación entre ambos.",
        duration: "18 min",
        series: "Combustible Diario",
        episode: 4,
        publishedAt: at(-2),
      },
    ],
  });

  console.log("Seeding posts…");
  const p1 = await prisma.post.create({
    data: {
      authorId: mateo.id,
      title: "¡Vendí mi primer pack de plantillas digitales! 🎉",
      body: "No lo puedo creer. Lo que armé en StarEduca ya tiene su primer cliente. Gracias a mi mentora y a mi papá que no dejó de animarme. Esto recién empieza.",
      category: "VOICE",
      createdAt: at(-1, 10),
    },
  });
  await prisma.comment.createMany({
    data: [
      { postId: p1.id, authorId: ana.id, body: "¡Felicitaciones Mateo! La primera de muchas. 👏", createdAt: at(-1, 11) },
      { postId: p1.id, authorId: roberto.id, body: "Orgulloso de ti, hijo. La torre de control lo vio todo. 😄", createdAt: at(-1, 12) },
    ],
  });
  await prisma.reaction.createMany({
    data: [
      { postId: p1.id, userId: ana.id, type: "CELEBRATE" },
      { postId: p1.id, userId: roberto.id, type: "CELEBRATE" },
      { postId: p1.id, userId: valentina.id, type: "LIKE" },
    ],
  });

  const p2 = await prisma.post.create({
    data: {
      authorId: valentina.id,
      title: "¿Qué herramientas de IA usan para sus productos?",
      body: "Estoy armando mi primer producto digital y quiero saber qué están usando ustedes. ¿Recomendaciones para empezar?",
      category: "COMMUNITY",
      createdAt: at(-2, 9),
    },
  });
  await prisma.comment.create({
    data: { postId: p2.id, authorId: ana.id, body: "Empieza simple: una idea, una herramienta. Lo vemos en el taller del viernes.", createdAt: at(-2, 10) },
  });

  await prisma.post.create({
    data: {
      authorId: ana.id,
      title: "Recordatorio: taller StarEmpresa este viernes",
      body: "Nos vemos el viernes para analizar el caso Tesla. Traigan preguntas — pensamiento empresarial de élite, sin excusas.",
      category: "ANNOUNCEMENT",
      // Demo del video embebido en el feed (charla TED de ejemplo)
      videoUrl: "https://www.youtube.com/watch?v=iG9CE55wbtY",
      createdAt: at(-3, 8),
    },
  });

  console.log("Seeding StarBooks…");
  await prisma.observatoryPost.createMany({
    data: [
      {
        title: "Hábitos Atómicos, en lenguaje Gen Z",
        slug: "habitos-atomicos",
        authors: "James Clear · resumen del equipo StarBooks",
        summary:
          "Mejorar 1% cada día suena aburrido hasta que ves el resultado en un año. El sistema le gana a la meta, siempre.",
        body: "Micro-resumen de las ideas clave: identidad antes que resultados, diseño del entorno, y la regla de los 2 minutos aplicada a tu primer producto digital.",
        category: "MENTAL",
        publishedAt: at(-9),
      },
      {
        title: "Inteligencia Emocional: sentir con sabiduría",
        slug: "inteligencia-emocional-goleman",
        authors: "Daniel Goleman · resumen del equipo StarBooks",
        summary:
          "Las redes llenan de ansiedad y comparación. Este clásico explica cómo nombrar lo que sientes te devuelve el control.",
        body: "Las 5 competencias de Goleman traducidas a situaciones reales de un adolescente: exámenes, redes sociales y primeras ventas.",
        category: "EMOTIONAL",
        publishedAt: at(-4),
      },
      {
        title: "Padre Rico, Padre Pobre: el dinero es energía",
        slug: "padre-rico-padre-pobre",
        authors: "Robert Kiyosaki · resumen del equipo StarBooks",
        summary:
          "Cuando generas tu primer ingreso real, la educación financiera deja de ser teoría. Activos, pasivos y tu primera venta.",
        body: "Los conceptos clave del libro aplicados al momento exacto en que un CEO Junior cobra su primera venta: qué hacer con ese dinero.",
        category: "FINANCIAL",
        publishedAt: at(-1),
      },
    ],
  });

  console.log("Seeding store products…");
  await prisma.product.createMany({
    data: [
      {
        name: "Family Pass",
        slug: "family-pass",
        tagline: "Un solo pase. Toda la familia.",
        description:
          "Acceso completo a CEO Junior + Padres 3.0 bajo una sola suscripción. Padre e hijo crecen juntos.",
        category: "SERVICE",
        status: "AVAILABLE",
        price: "Suscripción mensual",
        icon: "⭐",
        featured: true,
        position: 0,
      },
      {
        name: "App StarVoice",
        slug: "app-starvoice",
        tagline: "Combustible diario en tu bolsillo",
        description:
          "Audios, historias y relatos para empezar el día con propósito y guía moral. Nuevo contenido cada mañana.",
        category: "APP",
        status: "AVAILABLE",
        price: "Incluido en Family Pass",
        icon: "🎧",
        position: 1,
      },
      {
        name: "App StarBooks",
        slug: "app-starbooks",
        tagline: "Mentalidad acelerada, libro a libro",
        description:
          "Micro-resúmenes de desarrollo personal en lenguaje Gen Z. Cortos, potentes y listos para aplicar.",
        category: "APP",
        status: "BETA",
        price: "Incluido en Family Pass",
        icon: "📚",
        position: 2,
      },
      {
        name: "App StarEmpresa",
        slug: "app-starempresa",
        tagline: "El diferencial Harvard",
        description:
          "Análisis de empresas reales (Amazon, Tesla, Apple) con la metodología del caso. Pensamiento empresarial de élite desde los 14.",
        category: "APP",
        status: "COMING_SOON",
        icon: "🚀",
        position: 3,
      },
      {
        name: "App StarEduca",
        slug: "app-stareduca",
        tagline: "La fábrica de recursos",
        description:
          "Formación técnica para crear y vender productos digitales. Ingresos reales desde jóvenes.",
        category: "APP",
        status: "COMING_SOON",
        icon: "🛠️",
        position: 4,
      },
      {
        name: "English Pre-U",
        slug: "english-pre-u",
        tagline: "El puente global",
        description:
          "Programa de inglés con propósito académico y estándar universitario internacional, para el adolescente y para la familia (English Together).",
        category: "SERVICE",
        status: "AVAILABLE",
        price: "Consultar",
        icon: "🌎",
        position: 5,
      },
      {
        name: "Conferencias de Henry Orellana",
        slug: "conferencias-henry",
        tagline: "Henry en el escenario",
        description:
          "Padres 3.0, CEO Junior y Liderazgo Transformacional: conferencias que transforman, desde auditorios corporativos hasta comunidades latinas.",
        category: "SERVICE",
        status: "AVAILABLE",
        price: "Consultar agenda",
        icon: "🎤",
        position: 6,
      },
      {
        name: "Mentoría GÉNESIS i7™",
        slug: "mentoria-genesis-i7",
        tagline: "Acompañamiento de cohorte",
        description:
          "Mentores certificados guían a cada cohorte por las 7 inteligencias durante 7 semanas, con seguimiento en la Torre de Control.",
        category: "SERVICE",
        status: "COMING_SOON",
        icon: "🧭",
        position: 7,
      },
    ],
  });

  console.log("Seeding chat channels & messages…");
  const general = await prisma.channel.create({
    data: { name: "General", slug: "general", description: "Conversación abierta de la comunidad.", isPrivate: true, position: 0 },
  });
  await prisma.channel.create({
    data: { name: "CEO Junior", slug: "ceo-junior", description: "Canal de los adolescentes del programa.", isPrivate: true, position: 1 },
  });
  await prisma.channel.create({
    data: { name: "Padres 3.0", slug: "padres-30", description: "Espacio para la familia.", isPrivate: true, position: 2 },
  });
  await prisma.channel.create({
    data: { name: "Mentores", slug: "mentores", description: "Espacio de mentores.", isPrivate: true, position: 3 },
  });
  await prisma.message.createMany({
    data: [
      { channelId: general.id, userId: ana.id, body: "¡Bienvenidos al chat de la comunidad! ⭐", createdAt: at(-2, 9) },
      { channelId: general.id, userId: mateo.id, body: "Holaaa, feliz de estar acá.", createdAt: at(-2, 9, 5) },
      { channelId: general.id, userId: diego.id, body: "¿Alguien para repasar el caso Amazon antes del taller?", createdAt: at(-1, 16) },
    ],
  });

  console.log(`Done. Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
