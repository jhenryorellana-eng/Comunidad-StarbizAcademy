"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { PLATFORM_TREE, leafForPath } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";

/**
 * Barra de ubicación (sólo móvil y tablet).
 *
 * Antes esto era una fila de pestañas —Comunidad · Bootcamp · Padres ·
 * StarbizAcademy— que repetía casi literalmente la barra del header y competía
 * además con la lateral. Tres navegaciones diciendo lo mismo.
 *
 * Ahora la navegación entera vive en un solo sitio (el árbol de la lateral, y
 * su gemelo en el panel móvil), y lo que queda aquí es otra cosa: decir DÓNDE
 * ESTÁS. Con tres secciones y once destinos, un icono de menú a secas deja al
 * visitante sin referencia; la píldora la da y de paso abre el árbol completo.
 *
 * En escritorio no aparece: allí la lateral está siempre a la vista.
 */
export function SectionTabs({ leading }: { leading?: ReactNode }) {
  const { dict } = useI18n();
  const pathname = usePathname();

  const hoja = leafForPath(pathname);
  const seccion = PLATFORM_TREE.find((s) => pathname.startsWith(s.base));

  const N = dict.community.nav;
  const etiquetaHoja = hoja
    ? dict.community.spaces[hoja.key as keyof typeof dict.community.spaces]
    : undefined;
  const etiquetaSeccion = seccion
    ? N.sections[seccion.key as keyof typeof N.sections]
    : undefined;

  return (
    // Opaca a propósito: esta barra es sticky y queda justo encima del banner,
    // que tiene animaciones infinitas. Un `backdrop-filter` sobre algo que se
    // mueve obliga a recalcular el desenfoque en cada fotograma, sin parar
    // nunca, y en un móvil eso se lleva por delante la fluidez de todo.
    <div className="scroll-lift sticky top-16 z-30 border-b border-black/[0.05] bg-surface lg:hidden">
      <div className="container-ac">
        <div className="flex items-center gap-2 py-1.5">
          {/* El botón del menú va primero y en el flujo normal: así sigue a
              esta barra aunque cambie la altura de la cabecera. Antes vivía en
              un `fixed` con un desplazamiento a ojo, y la cinta del bootcamp
              lo descuadraba. */}
          {leading}

          <div className="flex min-w-0 items-baseline gap-1.5">
            {etiquetaSeccion && (
              <span className="shrink-0 font-display text-[0.6rem] font-bold uppercase tracking-[0.14em] text-muted">
                {etiquetaSeccion}
              </span>
            )}
            {etiquetaHoja && (
              <>
                <Icon
                  name={"arrowRight" as IconName}
                  size={9}
                  className="shrink-0 self-center text-muted/50"
                />
                {/* Con el titular fuera de la página en móvil, esta línea ES el
                    título. Necesita el peso que le corresponde. */}
                <span className="truncate font-display text-[1.05rem] font-extrabold text-navy">
                  {etiquetaHoja}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
