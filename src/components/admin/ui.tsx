import type { ReactNode } from "react";
import { Button } from "@/components/ui";

const inputCls =
  "w-full rounded-xl border border-surface-line bg-paper px-3.5 py-2.5 text-sm text-navy placeholder:text-muted/70 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20";

export function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  span,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number;
  span?: boolean;
}) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-sm font-medium text-navy">{label}</label>
      <input
        className={inputCls}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  );
}

export function TextareaField({
  label,
  name,
  rows = 3,
  required,
}: {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-sm font-medium text-navy">{label}</label>
      <textarea className={inputCls} name={name} rows={rows} required={required} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-navy">{label}</label>
      <select className={inputCls} name={name} defaultValue={defaultValue}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxField({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-navy">
      <input type="checkbox" name={name} className="h-4 w-4 rounded border-surface-line" />
      {label}
    </label>
  );
}

export function AdminForm({
  action,
  submit = "Crear",
  title,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submit?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <form action={action} className="mb-8 rounded-2xl border border-surface-line bg-paper p-6">
      <h2 className="mb-4 font-bold text-navy">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
      <div className="mt-5">
        <Button type="submit" size="sm">
          {submit}
        </Button>
      </div>
    </form>
  );
}

export function DeleteButton({
  action,
  id,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
      >
        Eliminar
      </button>
    </form>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="mb-6 text-2xl font-extrabold text-navy">{children}</h1>;
}
