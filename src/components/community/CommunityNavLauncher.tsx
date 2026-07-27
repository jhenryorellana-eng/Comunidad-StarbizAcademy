"use client";

import { useI18n } from "@/lib/i18n/client";
import { Icon } from "@/components/icons";
import { useCommunityNav } from "./navContext";

/**
 * Botón de menú de la comunidad.
 *
 * Va como PRIMER elemento dentro de la barra de secciones, en el flujo normal.
 * Antes era `fixed` con un `top` fijo adivinado a mano, y cualquier cosa que
 * cambiara la altura de la cabecera (p. ej. la cinta del bootcamp) lo dejaba
 * descuadrado. Al vivir dentro de la barra, la sigue siempre.
 */
export function CommunityNavLauncher() {
  const { dict } = useI18n();
  const { open, openMenu } = useCommunityNav();

  return (
    <button
      type="button"
      // Se reporta el centro del botón: el panel nace exactamente de aquí y
      // vuelve aquí al cerrarse.
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        openMenu({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={dict.community.spacesLabel}
      aria-expanded={open}
      data-tour="nav"
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-[0_4px_14px_rgba(26,39,68,0.3)] transition-transform active:scale-95 lg:hidden"
    >
      <Icon name="menu" size={18} />
      <span
        className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-cyan-bright shadow-[0_0_6px_2px_rgba(34,211,238,0.7)]"
        aria-hidden
      />
    </button>
  );
}
