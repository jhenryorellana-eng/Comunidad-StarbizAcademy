import { prisma } from "@/lib/prisma";
import { createEvent, deleteEvent } from "../actions";
import { EVENT_CATEGORIES, EVENT_STATUSES } from "@/lib/constants";
import {
  AdminForm,
  Field,
  TextareaField,
  SelectField,
  CheckboxField,
  DeleteButton,
  PageTitle,
} from "@/components/admin/ui";

export default async function AdminEvents() {
  const events = await prisma.event.findMany({ orderBy: { startsAt: "desc" } });

  return (
    <div>
      <PageTitle>Eventos</PageTitle>

      <AdminForm action={createEvent} title="Nuevo evento" submit="Crear evento">
        <Field label="Título" name="title" required />
        <Field label="Anfitrión" name="host" placeholder="StarbizAcademy" />
        <Field label="URL de grabación (eventos pasados)" name="recordingUrl" placeholder="https://youtube.com/…" />
        <Field label="Inicio" name="startsAt" type="datetime-local" required />
        <Field label="Fin" name="endsAt" type="datetime-local" />
        <Field label="Ubicación" name="location" placeholder="Zoom · En línea / Ciudad" />
        <Field label="Precio" name="price" placeholder="Free / $50 USD" />
        <SelectField
          label="Categoría"
          name="category"
          options={EVENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <SelectField
          label="Estado"
          name="status"
          options={EVENT_STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <TextareaField label="Descripción" name="description" />
        <div className="flex items-center gap-6 sm:col-span-2">
          <CheckboxField label="En línea" name="isOnline" />
          <CheckboxField label="Destacado" name="featured" />
        </div>
      </AdminForm>

      <div className="space-y-2">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-surface-line bg-paper px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-navy">{e.title}</p>
              <p className="text-xs text-muted">
                {e.startsAt.toLocaleString()} · {e.category} · {e.status}
                {e.featured ? " · ★" : ""}
              </p>
            </div>
            <DeleteButton action={deleteEvent} id={e.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
