"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseVideoUrl } from "@/lib/video";

async function requireAdmin() {
  const s = await getSession();
  if (s?.role !== "ADMIN") redirect("/login");
  return s;
}

function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "item"}-${suffix}`;
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/* ---------------- Events ---------------- */
export async function createEvent(fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title");
  const startsRaw = str(fd, "startsAt");
  if (!title || !startsRaw) return;
  const endsRaw = str(fd, "endsAt");
  await prisma.event.create({
    data: {
      title,
      slug: slugify(title),
      description: str(fd, "description"),
      startsAt: new Date(startsRaw),
      endsAt: endsRaw ? new Date(endsRaw) : null,
      isOnline: fd.get("isOnline") === "on",
      location: str(fd, "location") || null,
      host: str(fd, "host") || "StarbizAcademy",
      category: str(fd, "category") || "WEEKLY",
      price: str(fd, "price") || null,
      status: str(fd, "status") || "UPCOMING",
      featured: fd.get("featured") === "on",
      recordingUrl: str(fd, "recordingUrl") || null,
    },
  });
  revalidatePath("/admin/events");
  revalidatePath("/comunidad/eventos");
}

export async function deleteEvent(fd: FormData) {
  await requireAdmin();
  await prisma.event.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/events");
  revalidatePath("/comunidad/eventos");
}

/* ---------------- Podcast ---------------- */
export async function createEpisode(fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title");
  if (!title) return;
  const epRaw = str(fd, "episode");
  await prisma.podcastEpisode.create({
    data: {
      title,
      slug: slugify(title),
      guest: str(fd, "guest") || null,
      description: str(fd, "description"),
      duration: str(fd, "duration") || null,
      series: str(fd, "series") || null,
      episode: epRaw ? Number(epRaw) : null,
      audioUrl: str(fd, "audioUrl") || null,
    },
  });
  revalidatePath("/admin/podcast");
  revalidatePath("/comunidad/podcast");
}

export async function deleteEpisode(fd: FormData) {
  await requireAdmin();
  await prisma.podcastEpisode.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/podcast");
  revalidatePath("/comunidad/podcast");
}

/* ---------------- Observatory ---------------- */
export async function createObservatory(fd: FormData) {
  await requireAdmin();
  const title = str(fd, "title");
  if (!title) return;
  await prisma.observatoryPost.create({
    data: {
      title,
      slug: slugify(title),
      authors: str(fd, "authors"),
      summary: str(fd, "summary"),
      body: str(fd, "body") || str(fd, "summary"),
      category: str(fd, "category") || "OPPORTUNITY",
      cover: str(fd, "cover") || null,
    },
  });
  revalidatePath("/admin/observatory");
  revalidatePath("/comunidad/blogs");
}

export async function deleteObservatory(fd: FormData) {
  await requireAdmin();
  await prisma.observatoryPost.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/observatory");
  revalidatePath("/comunidad/blogs");
}

/* ---------------- Chapters ---------------- */
export async function createChapter(fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name");
  const countryId = str(fd, "countryId");
  const city = str(fd, "city");
  if (!name || !countryId || !city) return;
  await prisma.chapter.create({
    data: {
      countryId,
      city,
      name,
      slug: slugify(name),
      stake: str(fd, "stake") || null,
      cohortSize: Number(str(fd, "cohortSize")) || 30,
      currentWeek: Number(str(fd, "currentWeek")) || 0,
      status: str(fd, "status") || "RECRUITING",
      mentorName: str(fd, "mentorName") || null,
      story: str(fd, "story") || null,
    },
  });
  revalidatePath("/admin/chapters");
  revalidatePath("/comunidad/cohortes");
}

export async function deleteChapter(fd: FormData) {
  await requireAdmin();
  await prisma.chapter.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/chapters");
  revalidatePath("/comunidad/cohortes");
}

export async function createChapterUpdate(fd: FormData) {
  await requireAdmin();
  const chapterId = str(fd, "chapterId");
  const title = str(fd, "title");
  if (!chapterId || !title) return;
  const weekRaw = str(fd, "week");
  await prisma.chapterUpdate.create({
    data: {
      chapterId,
      week: weekRaw ? Number(weekRaw) : null,
      title,
      body: str(fd, "body"),
      photos: "[]",
    },
  });
  // optionally advance the chapter's current week
  const advance = str(fd, "advanceWeek");
  if (advance && weekRaw) {
    await prisma.chapter.update({
      where: { id: chapterId },
      data: { currentWeek: Number(weekRaw) },
    });
  }
  revalidatePath("/admin/chapters");
}

/* ---------------- Store (apps & services) ---------------- */
export async function createProduct(fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) return;
  await prisma.product.create({
    data: {
      name,
      slug: slugify(name),
      tagline: str(fd, "tagline"),
      description: str(fd, "description"),
      category: str(fd, "category") || "APP",
      status: str(fd, "status") || "COMING_SOON",
      price: str(fd, "price") || null,
      url: str(fd, "url") || null,
      icon: str(fd, "icon") || null,
      featured: fd.get("featured") === "on",
      position: Number(str(fd, "position")) || 0,
    },
  });
  revalidatePath("/admin/store");
  revalidatePath("/store");
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/store");
  revalidatePath("/store");
}

/* ---------------- Reports (trust & safety) ---------------- */
export async function resolveReport(fd: FormData) {
  await requireAdmin();
  await prisma.report.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/reports");
}

/* ---------------- Posts (moderation) ---------------- */
export async function deletePost(fd: FormData) {
  await requireAdmin();
  await prisma.post.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/posts");
  revalidatePath("/comunidad/posts");
}

export async function createAnnouncement(fd: FormData) {
  const admin = await requireAdmin();
  const title = str(fd, "title");
  if (!title) return;
  // Solo se guarda el video si el parser lo reconoce (YouTube/Vimeo).
  const rawVideo = str(fd, "videoUrl");
  await prisma.post.create({
    data: {
      authorId: admin.sub,
      title,
      body: str(fd, "body"),
      category: "ANNOUNCEMENT",
      videoUrl: rawVideo && parseVideoUrl(rawVideo) ? rawVideo : null,
    },
  });
  revalidatePath("/admin/posts");
  revalidatePath("/comunidad/posts");
}

/* ---------------- Bootcamp: alta y cobro a mano ---------------- */

/**
 * No todo el mundo puede pagar con tarjeta.
 *
 * Hay clientes que pagan por transferencia, en efectivo o por Yape, y esa
 * plata ocupa un cupo igual que la de Stripe. Sin esto, esas ventas viven en
 * un cuaderno aparte: no cuentan en el contador de cupos de la página, no
 * salen en el CSV y nadie se acuerda de emitirles las cartas.
 *
 * Se guarda CÓMO se pagó y con qué referencia, porque el dinero de Stripe se
 * concilia solo y el de mano hay que poder encontrarlo en el extracto.
 */

/** Edad cumplida. Se repite la regla del servidor público a propósito: aquí
    también entra un nombre que acabará impreso en una carta. */
function edadDe(f: Date): number {
  const hoy = new Date();
  let a = hoy.getUTCFullYear() - f.getUTCFullYear();
  const m = hoy.getUTCMonth() - f.getUTCMonth();
  if (m < 0 || (m === 0 && hoy.getUTCDate() < f.getUTCDate())) a--;
  return a;
}

const METODOS_MANO = ["TRANSFERENCIA", "EFECTIVO", "OTRO"] as const;

export async function crearReservaManual(fd: FormData) {
  const admin = await requireAdmin();

  const participantName = str(fd, "participantName");
  const email = str(fd, "email").toLowerCase();
  if (participantName.length < 3 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;

  const nacimientoRaw = str(fd, "participantBirthdate");
  let participantBirthdate: Date | null = null;
  if (nacimientoRaw) {
    const d = new Date(`${nacimientoRaw}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return;
    const edad = edadDe(d);
    if (edad < 10 || edad > 19) return;
    participantBirthdate = d;
  }

  const metodo = str(fd, "paymentMethod");
  const paymentMethod = (METODOS_MANO as readonly string[]).includes(metodo) ? metodo : "OTRO";

  const pagada = str(fd, "status") === "PAID";
  // El importe llega en dólares y se guarda en céntimos, igual que lo manda
  // Stripe: así el total del panel suma sin tener que distinguir el origen.
  const dolares = Number(str(fd, "amount") || "250");
  const amountTotal = Number.isFinite(dolares) && dolares >= 0 ? Math.round(dolares * 100) : 25000;

  await prisma.bootcampRegistration.create({
    data: {
      status: pagada ? "PAID" : "PENDING",
      participantName,
      participantBirthdate,
      documentId: str(fd, "documentId") || null,
      nationality: str(fd, "nationality") || null,
      address: str(fd, "address") || null,
      residence: str(fd, "residence") || null,
      academicLevel: str(fd, "academicLevel") || null,
      email,
      payerName: str(fd, "payerName") || null,
      phone: str(fd, "phone") || null,
      companionName: str(fd, "companionName") || null,
      paymentMethod,
      paymentRef: str(fd, "paymentRef") || null,
      notes: str(fd, "notes") || null,
      registeredBy: admin.email,
      amountTotal: pagada ? amountTotal : 0,
      paidAt: pagada ? new Date() : null,
    },
  });

  revalidatePath("/admin/bootcamp");
  // El contador de cupos de la página pública cuenta las PAID.
  revalidatePath("/bootcamp/reservar");
}

/**
 * El caso más frecuente: alguien rellenó el formulario público, se echó atrás
 * en la pasarela y luego pagó por transferencia. Los datos ya están; sólo
 * falta darle el cobro por bueno.
 */
export async function marcarPagadaManual(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  if (!id) return;

  const actual = await prisma.bootcampRegistration.findUnique({
    where: { id },
    select: { status: true },
  });
  // Cobrar dos veces el mismo cupo es el error que peor se explica después.
  if (!actual || actual.status === "PAID") return;

  const metodo = str(fd, "paymentMethod");
  const paymentMethod = (METODOS_MANO as readonly string[]).includes(metodo) ? metodo : "OTRO";
  const dolares = Number(str(fd, "amount") || "250");
  const amountTotal = Number.isFinite(dolares) && dolares >= 0 ? Math.round(dolares * 100) : 25000;

  await prisma.bootcampRegistration.update({
    where: { id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paymentMethod,
      paymentRef: str(fd, "paymentRef") || null,
      amountTotal,
      registeredBy: admin.email,
    },
  });

  revalidatePath("/admin/bootcamp");
  revalidatePath("/bootcamp/reservar");
}

/**
 * Borrar una reserva. Dar de alta a mano significa que habrá erratas, y sin
 * esto la única salida era entrar a la base por consola.
 *
 * NUNCA borra una pagada por Stripe: dejaría un cobro huérfano en la pasarela
 * sin nada que lo explique en el panel. Ésas se reembolsan en Stripe primero.
 */
export async function borrarReserva(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return;

  const r = await prisma.bootcampRegistration.findUnique({
    where: { id },
    select: { status: true, stripeSessionId: true, paymentMethod: true },
  });
  if (!r) return;
  if (r.status === "PAID" && r.paymentMethod === "STRIPE" && r.stripeSessionId) return;

  await prisma.bootcampRegistration.delete({ where: { id } });
  revalidatePath("/admin/bootcamp");
  revalidatePath("/bootcamp/reservar");
}
