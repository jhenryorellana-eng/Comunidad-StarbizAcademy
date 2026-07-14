import { prisma } from "@/lib/prisma";
import { createAnnouncement, deletePost } from "../actions";
import { AdminForm, Field, TextareaField, DeleteButton, PageTitle } from "@/components/admin/ui";

export default async function AdminPosts() {
  const posts = await prisma.post.findMany({
    include: { author: { select: { name: true } }, _count: { select: { comments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageTitle>Publicaciones</PageTitle>

      <AdminForm action={createAnnouncement} title="Nuevo anuncio" submit="Publicar anuncio">
        <Field label="Título" name="title" required span />
        <TextareaField label="Mensaje" name="body" />
        <Field
          label="URL de video (YouTube o Vimeo)"
          name="videoUrl"
          placeholder="https://youtube.com/watch?v=…"
          span
        />
      </AdminForm>

      <div className="space-y-2">
        {posts.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-surface-line bg-paper px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-navy">{p.title}</p>
              <p className="text-xs text-muted">
                {p.author.name} · {p.category} · {p._count.comments} comentarios
              </p>
            </div>
            <DeleteButton action={deletePost} id={p.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
