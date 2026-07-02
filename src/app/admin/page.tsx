import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [events, episodes, posts, chapters, observatory, members] =
    await Promise.all([
      prisma.event.count(),
      prisma.podcastEpisode.count(),
      prisma.post.count(),
      prisma.chapter.count(),
      prisma.observatoryPost.count(),
      prisma.user.count(),
    ]);

  const cards: Array<[string, number, string]> = [
    ["Eventos", events, "/admin/events"],
    ["Audios StarVoice", episodes, "/admin/podcast"],
    ["Publicaciones", posts, "/admin/posts"],
    ["Cohortes", chapters, "/admin/chapters"],
    ["StarBooks", observatory, "/admin/observatory"],
    ["Usuarios", members, "/admin/posts"],
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Panel de administración</h1>
      <p className="mt-1 text-muted">Gestiona el contenido de la comunidad y las cohortes.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map(([label, count, href]) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-surface-line bg-paper p-5 transition-shadow hover:shadow-sm"
          >
            <p className="font-display text-3xl font-extrabold text-navy">{count}</p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
