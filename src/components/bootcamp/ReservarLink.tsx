import Link from "next/link";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";

/**
 * La llamada de la portada. Un ENLACE, no un botón con lógica.
 *
 * Antes era un componente de cliente que decidía por sí mismo si podías pagar y
 * llamaba a la API. Dos problemas: la decisión se repetía en tres sitios de la
 * misma página, y al ser JavaScript, un navegador con la versión anterior en
 * caché seguía llamando al pago con el formato viejo — que es exactamente el
 * error que apareció, "falta indicar a quién le reservas".
 *
 * Un enlace no se puede quedar rancio. Lleva a /bootcamp/reservar, y allí se
 * decide una sola vez, en el servidor.
 */
export function ReservarLink({ label, className }: { label: string; className?: string }) {
  return (
    <Link
      href="/bootcamp/reservar"
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-semibold text-navy shadow-[0_10px_34px_rgba(251,191,36,0.4)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-300",
        className,
      )}
    >
      {label}
      <Icon name="arrowRight" size={16} />
    </Link>
  );
}
