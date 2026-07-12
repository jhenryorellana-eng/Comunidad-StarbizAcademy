import { prisma } from "@/lib/prisma";
import { createObservatory, deleteObservatory } from "../actions";
import {
  AdminForm,
  Field,
  TextareaField,
  SelectField,
  DeleteButton,
  PageTitle,
} from "@/components/admin/ui";

const CAT_OPTS = [
  { value: "OPPORTUNITY", label: "Oportunidad" },
  { value: "EMOTIONAL", label: "Emocional" },
  { value: "FINANCIAL", label: "Financiera" },
  { value: "MENTAL", label: "Mental" },
  { value: "SOCIAL", label: "Social" },
  { value: "TECH", label: "Tecnología" },
];

export default async function AdminObservatory() {
  const posts = await prisma.observatoryPost.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <PageTitle>Blogs</PageTitle>

      <AdminForm action={createObservatory} title="Nuevo artículo" submit="Publicar">
        <Field label="Título" name="title" required />
        <Field label="Autores" name="authors" placeholder="Equipo StarbizAcademy" />
        <SelectField label="Categoría" name="category" options={CAT_OPTS} />
        <Field label="Portada (URL de imagen)" name="cover" placeholder="https://…" />
        <TextareaField label="Resumen" name="summary" rows={2} />
        <TextareaField label="Cuerpo" name="body" rows={6} />
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
                {p.category} · {p.authors}
              </p>
            </div>
            <DeleteButton action={deleteObservatory} id={p.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
