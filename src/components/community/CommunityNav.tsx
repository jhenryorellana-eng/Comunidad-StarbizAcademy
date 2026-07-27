"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { PLATFORM_TREE, type NavLeaf, type NavSection } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/components/ui";

/**
 * Barra lateral de escritorio. TRES secciones desplegables y nada más.
 *
 * Antes esta misma lista vivía en tres sitios a la vez —la barra del header, la
 * fila de pestañas y esta— y las tres decían casi lo mismo. Ahora la navegación
 * está aquí, entera, y las otras dos desaparecieron.
 *
 * Lleva contadores por espacio: diez enlaces mudos no cuentan nada de una
 * comunidad viva, y el número es la señal más barata de que hay algo detrás de
 * cada puerta.
 */
export function CommunityNav({
  isMember,
  counts = {},
}: {
  isMember: boolean;
  counts?: Record<string, number>;
}) {
  const pathname = usePathname();

  // Arranca abierta la sección donde estás. Se inicializa de forma perezosa en
  // vez de sincronizarse por efecto: así no hay un primer pintado con todo
  // cerrado que luego se abre de golpe.
  const [abiertas, setAbiertas] = useState<Record<string, boolean>>(() => {
    const inicial: Record<string, boolean> = {};
    for (const s of PLATFORM_TREE) inicial[s.key] = pathname.startsWith(s.base);
    // Si se llega desde fuera del árbol, al menos Comunidad queda abierta.
    if (!Object.values(inicial).some(Boolean)) inicial.comunidad = true;
    return inicial;
  });

  return (
    <aside data-tour="nav" className="hidden w-[260px] shrink-0 lg:block">
      <nav className="sticky top-20 flex flex-col gap-1.5 rounded-2xl border border-surface-line bg-paper p-2 shadow-sm">
        {PLATFORM_TREE.map((seccion) => (
          <Seccion
            key={seccion.key}
            seccion={seccion}
            abierta={Boolean(abiertas[seccion.key])}
            onToggle={() =>
              setAbiertas((a) => ({ ...a, [seccion.key]: !a[seccion.key] }))
            }
            isMember={isMember}
            counts={counts}
          />
        ))}
      </nav>
    </aside>
  );
}

function Seccion({
  seccion,
  abierta,
  onToggle,
  isMember,
  counts,
}: {
  seccion: NavSection;
  abierta: boolean;
  onToggle: () => void;
  isMember: boolean;
  counts: Record<string, number>;
}) {
  const { dict } = useI18n();
  const pathname = usePathname();
  const N = dict.community.nav;
  const titulo = N.sections[seccion.key as keyof typeof N.sections];

  return (
    // Cada grupo declara su propio acento. Así, desplegar Padres lo tiñe de
    // dorado aunque estés dentro de Comunidad: el color dice de quién es esa
    // sección antes incluso de entrar.
    <div data-seccion={seccion.key}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors",
          abierta ? "bg-acento-suave" : "hover:bg-navy/[0.04]",
        )}
      >
        <Icon
          name="arrowRight"
          size={12}
          className={cn(
            "shrink-0 transition-transform duration-200",
            abierta ? "rotate-90 text-acento" : "text-navy/40",
          )}
        />
        <span
          className={cn(
            "font-display text-[0.7rem] font-bold uppercase tracking-[0.13em]",
            abierta ? "text-acento-tinta" : "text-navy/70",
          )}
        >
          {titulo}
        </span>
        {!seccion.live && (
          <span className="ml-auto rounded-full bg-acento-suave px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-acento-tinta">
            {N.soon}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div
            // `height: auto` es de las pocas animaciones de layout que valen la
            // pena: el desplegable tiene que empujar lo de abajo, no taparlo.
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 pt-1">
              {seccion.children.length === 0 ? (
                <p className="px-3 pb-2 pt-1 text-xs leading-relaxed text-muted">
                  {N.emptySection}
                </p>
              ) : (
                seccion.children.map((hoja) => (
                  <NavItem
                    key={hoja.key}
                    hoja={hoja}
                    active={
                      hoja.exact
                        ? pathname === hoja.href
                        : pathname.startsWith(hoja.href)
                    }
                    locked={Boolean(hoja.gated) && !isMember}
                    count={counts[hoja.key]}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({
  hoja,
  active,
  locked,
  count,
}: {
  hoja: NavLeaf;
  active: boolean;
  locked?: boolean;
  count?: number;
}) {
  const { dict } = useI18n();
  const label = dict.community.spaces[hoja.key as keyof typeof dict.community.spaces];

  // Los enlaces que salen del sitio no son navegación interna: se abren en
  // pestaña nueva para no sacar a nadie de la comunidad, y lo dicen con un
  // icono en vez de dejar que se descubra al volver.
  const Etiqueta = hoja.external ? "a" : Link;
  const extra = hoja.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Etiqueta
      href={hoja.href}
      {...extra}
      className={cn(
        "group relative ml-2 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-navy text-white shadow-[0_4px_18px_rgba(26,39,68,0.28)]"
          : "text-ink hover:translate-x-0.5 hover:bg-acento-suave hover:text-navy",
        // El bootcamp es el destino que queremos que se vea. Sin gritar: un
        // borde dorado basta cuando todo lo demás es neutro.
        hoja.featured && !active && "border border-gold/35 bg-gold/[0.06]",
        locked && !active && "opacity-50",
      )}
    >
      {active && (
        <motion.span
          layoutId="community-nav-led"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-acento-vivo shadow-[0_0_10px_2px_var(--acento-vivo)]"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          aria-hidden
        />
      )}
      <Icon
        name={hoja.icon as IconName}
        size={18}
        className={cn(
          "transition-colors duration-200",
          active
            ? "text-acento-vivo"
            : hoja.featured
              ? "text-gold-700"
              : "text-navy/55 group-hover:text-acento",
        )}
      />
      <span className={cn(hoja.featured && !active && "font-semibold text-navy")}>
        {label}
      </span>
      {locked ? (
        <Icon name="lock" size={13} className="ml-auto opacity-60" />
      ) : (
        count !== undefined &&
        count > 0 && (
          <span
            className={cn(
              "ml-auto rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold tabular-nums transition-colors",
              active ? "bg-white/12 text-acento-vivo" : "bg-navy/[0.06] text-muted",
            )}
          >
            {count}
          </span>
        )
      )}
      {hoja.external && (
        <Icon name="external" size={12} className="ml-auto shrink-0 text-gold-700" />
      )}
    </Etiqueta>
  );
}
