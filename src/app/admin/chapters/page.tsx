import { prisma } from "@/lib/prisma";
import { createChapter, deleteChapter, createChapterUpdate } from "../actions";
import {
  AdminForm,
  Field,
  TextareaField,
  SelectField,
  CheckboxField,
  DeleteButton,
  PageTitle,
} from "@/components/admin/ui";

const STATUS_OPTS = [
  { value: "RECRUITING", label: "Reclutando" },
  { value: "ACTIVE", label: "En curso" },
  { value: "GRADUATED", label: "Graduado" },
];

export default async function AdminChapters() {
  const [countries, chapters] = await Promise.all([
    prisma.country.findMany({ orderBy: { name: "asc" } }),
    prisma.chapter.findMany({
      include: { country: true, _count: { select: { updates: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <PageTitle>Cohortes</PageTitle>

      <AdminForm action={createChapter} title="Nueva cohorte" submit="Crear cohorte">
        <Field label="Nombre" name="name" required placeholder="Cohorte Provo" />
        <SelectField
          label="País"
          name="countryId"
          options={countries.map((c) => ({ value: c.id, label: `${c.flag ?? ""} ${c.name}` }))}
        />
        <Field label="Ciudad" name="city" required />
        <Field label="Estaca" name="stake" />
        <Field label="Tamaño de cohorte" name="cohortSize" type="number" defaultValue={30} />
        <Field label="Semana actual (0–7)" name="currentWeek" type="number" defaultValue={0} />
        <SelectField label="Estado" name="status" options={STATUS_OPTS} />
        <Field label="Mentor" name="mentorName" />
        <TextareaField label="Historia" name="story" />
      </AdminForm>

      <div className="space-y-4">
        {chapters.map((ch) => (
          <div key={ch.id} className="rounded-2xl border border-surface-line bg-paper p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-navy">{ch.name}</p>
                <p className="text-xs text-muted">
                  {ch.country.flag} {ch.city}, {ch.country.name} · semana {ch.currentWeek}/7 ·{" "}
                  {ch.cohortSize} estudiantes · {ch._count.updates} updates
                </p>
              </div>
              <DeleteButton action={deleteChapter} id={ch.id} />
            </div>

            {/* post an update */}
            <form
              action={createChapterUpdate}
              className="mt-4 grid gap-3 rounded-xl bg-surface p-4 sm:grid-cols-2"
            >
              <input type="hidden" name="chapterId" value={ch.id} />
              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy">Semana</label>
                <input
                  name="week"
                  type="number"
                  className="w-full rounded-lg border border-surface-line bg-paper px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy">Título</label>
                <input
                  name="title"
                  required
                  className="w-full rounded-lg border border-surface-line bg-paper px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-navy">Update</label>
                <textarea
                  name="body"
                  rows={2}
                  className="w-full rounded-lg border border-surface-line bg-paper px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center justify-between sm:col-span-2">
                <label className="flex items-center gap-2 text-xs text-navy">
                  <input type="checkbox" name="advanceWeek" className="h-4 w-4" />
                  Avanzar la cohorte a esta semana
                </label>
                <button
                  type="submit"
                  className="rounded-full bg-cyan px-4 py-1.5 text-sm font-medium text-white hover:bg-cyan-700"
                >
                  Publicar update
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
