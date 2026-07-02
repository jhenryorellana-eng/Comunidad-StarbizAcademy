"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
    },
  });
  revalidatePath("/admin/events");
  revalidatePath("/community/events");
}

export async function deleteEvent(fd: FormData) {
  await requireAdmin();
  await prisma.event.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/events");
  revalidatePath("/community/events");
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
  revalidatePath("/community/podcast");
}

export async function deleteEpisode(fd: FormData) {
  await requireAdmin();
  await prisma.podcastEpisode.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/podcast");
  revalidatePath("/community/podcast");
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
    },
  });
  revalidatePath("/admin/observatory");
  revalidatePath("/community/observatory");
}

export async function deleteObservatory(fd: FormData) {
  await requireAdmin();
  await prisma.observatoryPost.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/observatory");
  revalidatePath("/community/observatory");
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
  revalidatePath("/community/chapters");
}

export async function deleteChapter(fd: FormData) {
  await requireAdmin();
  await prisma.chapter.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/chapters");
  revalidatePath("/community/chapters");
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

/* ---------------- Posts (moderation) ---------------- */
export async function deletePost(fd: FormData) {
  await requireAdmin();
  await prisma.post.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/posts");
  revalidatePath("/community/posts");
}

export async function createAnnouncement(fd: FormData) {
  const admin = await requireAdmin();
  const title = str(fd, "title");
  if (!title) return;
  await prisma.post.create({
    data: {
      authorId: admin.sub,
      title,
      body: str(fd, "body"),
      category: "ANNOUNCEMENT",
    },
  });
  revalidatePath("/admin/posts");
  revalidatePath("/community/posts");
}
