import { prisma } from "@/lib/prisma";
import { createEpisode, deleteEpisode } from "../actions";
import {
  AdminForm,
  Field,
  TextareaField,
  DeleteButton,
  PageTitle,
} from "@/components/admin/ui";

export default async function AdminPodcast() {
  const episodes = await prisma.podcastEpisode.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <PageTitle>Podcast</PageTitle>

      <AdminForm action={createEpisode} title="Nuevo episodio" submit="Crear episodio">
        <Field label="Título" name="title" required />
        <Field label="Invitado" name="guest" />
        <Field label="Duración" name="duration" placeholder="32 min" />
        <Field label="Serie" name="series" placeholder="Temporada 1" />
        <Field label="Nº de episodio" name="episode" type="number" />
        <Field label="URL de audio (embed)" name="audioUrl" placeholder="Spotify / Apple / YouTube" />
        <TextareaField label="Descripción" name="description" />
      </AdminForm>

      <div className="space-y-2">
        {episodes.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-surface-line bg-paper px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-navy">{e.title}</p>
              <p className="text-xs text-muted">
                {e.guest ? `${e.guest} · ` : ""}
                {e.duration ?? ""} {e.episode != null ? `· Ep. ${e.episode}` : ""}
              </p>
            </div>
            <DeleteButton action={deleteEpisode} id={e.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
