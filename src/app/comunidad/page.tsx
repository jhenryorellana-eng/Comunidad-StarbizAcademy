import { redirect } from "next/navigation";

// Posts va primero: lo primero que ve el visitante es actividad, no un directorio.
export default function ComunidadIndex() {
  redirect("/comunidad/posts");
}
