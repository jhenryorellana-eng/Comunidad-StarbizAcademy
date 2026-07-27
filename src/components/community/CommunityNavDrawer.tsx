"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { PLATFORM_TREE, type NavLeaf } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/components/ui";
import { useCommunityNav } from "./navContext";

/* ===========================================================================
   MENÚ DE LA COMUNIDAD (móvil)

   Lámina a media pantalla de ancho y completa de alto, que brota del botón.
   Lleva el MISMO árbol que la barra lateral de escritorio: tres secciones
   desplegables, con Bootcamp, Chat y Tienda dentro de Comunidad.

   REGLA DE ORO: durante el gesto sólo se animan `transform` y `opacity`.
   Son las dos únicas propiedades que el navegador resuelve moviendo una
   textura ya pintada. Todo lo demás —clip-path, filter, backdrop-filter,
   box-shadow, width/height— obliga a repintar en cada fotograma, y en un móvil
   eso se ve como tirones. La primera versión animaba `clip-path` sobre un
   elemento con `backdrop-filter`, que es la peor combinación de las dos listas.

   Lo demás sigue igual que antes:

   · UN SOLO GESTO. La lámina entra como un único objeto, con el origen puesto
     en el botón: nace de ahí y vuelve ahí.
   · CERRAR SIEMPRE MÁS RÁPIDO QUE ABRIR. Esperar a que algo desaparezca irrita.
   · SIN ESPERAS PARA EL CONTENIDO. Lo que se percibía como lentitud no eran
     fotogramas perdidos: era que el texto tardaba en llegar.
=========================================================================== */

/** Ancho: algo más de la mitad. Con tres grupos y once destinos, la mitad justa
    dejaba las etiquetas demasiado apretadas. */
const PANEL_W = "w-[62vw] min-w-[236px] max-w-[340px]";

/** Curva de salida larga: arranca rápido y se posa. */
const SOFT = [0.22, 1, 0.36, 1] as const;
/** Apertura. 0.20s, no 0.42s.
    Lo que se percibía como lentitud no eran fotogramas perdidos: era que el
    menú tardaba en poder LEERSE. Medio segundo después del toque es una
    eternidad para un menú. */
const UNFOLD = { duration: 0.2, ease: [0.16, 1, 0.3, 1] } as const;
/** Cierre: aún más corto. Esperar a que algo desaparezca irrita más que
    esperar a que aparezca. */
const EXIT = { duration: 0.14, ease: [0.4, 0, 1, 0.6] } as const;

export function CommunityNavDrawer() {
  const { dict } = useI18n();
  const pathname = usePathname();
  const { open, isMember, origin, closeMenu } = useCommunityNav();
  const N = dict.community.nav;

  const [abiertas, setAbiertas] = useState<Record<string, boolean>>(() => {
    const inicial: Record<string, boolean> = {};
    for (const s of PLATFORM_TREE) inicial[s.key] = pathname.startsWith(s.base);
    if (!Object.values(inicial).some(Boolean)) inicial.comunidad = true;
    return inicial;
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    // El bloqueo del scroll se aplaza un fotograma a propósito. Cambiar
    // `overflow` en el body invalida la disposición de TODO el documento, y
    // hacerlo en el mismo fotograma del toque obliga al navegador a recalcular
    // el feed entero justo cuando debería estar arrancando la animación.
    const rafId = requestAnimationFrame(() => {
      document.body.style.overflow = "hidden";
    });
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeMenu]);

  // El origen del gesto es el botón: la lámina crece desde ahí y se recoge ahí.
  const at = `${origin.x}px ${origin.y}px`;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-navy/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.26, ease: SOFT } }}
            exit={{ opacity: 0, transition: EXIT }}
            onClick={closeMenu}
          />

          <motion.div
            className={cn(
              "absolute left-0 top-0 flex h-full flex-col overflow-hidden rounded-r-[28px]",
              "border-r border-white/[0.18]",
              // Los resplandores van como degradados radiales del propio fondo.
              // Antes eran <span> con `blur-3xl`: un filtro de 64px dentro de
              // una capa que escala puede forzar a re-rasterizar durante el
              // gesto. Un degradado es parte de la textura y no cuesta nada.
              "bg-[radial-gradient(120%_60%_at_0%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(90%_45%_at_100%_0%,rgba(251,191,36,0.12),transparent_62%),linear-gradient(158deg,#12203c_0%,#0d1830_46%,#0a1020_100%)]",
              "shadow-[18px_0_60px_-12px_rgba(6,10,24,0.6)]",
              PANEL_W,
            )}
            // Escala 0.92 -> 1, no 0.16 -> 1. Ampliar seis veces obliga al
            // navegador a estirar una textura rasterizada a tamaño pequeño: el
            // panel se ve blando mientras crece y se endurece de golpe al final.
            style={{ transformOrigin: at }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: UNFOLD }}
            exit={{ opacity: 0, scale: 0.94, transition: EXIT }}
          >
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-24"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 100%)",
              }}
              aria-hidden
            />

            <motion.div
              className="relative flex min-h-0 flex-1 flex-col"
              // Sin retraso: el menú se puede leer a los ~0.15s del toque.
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.16, ease: "linear" } }}
              exit={{ opacity: 0, transition: { duration: 0.08, ease: "linear" } }}
            >
              <div className="flex items-center justify-between px-4 pt-4">
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  {dict.community.spacesLabel}
                </span>
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label={dict.common.close}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors active:bg-white/20"
                >
                  <Icon name="close" size={15} />
                </button>
              </div>

              <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-2.5 pb-6">
                {PLATFORM_TREE.map((seccion) => {
                  const abierta = Boolean(abiertas[seccion.key]);
                  return (
                    <div key={seccion.key} className="mt-1.5">
                      <button
                        type="button"
                        aria-expanded={abierta}
                        onClick={() =>
                          setAbiertas((a) => ({ ...a, [seccion.key]: !a[seccion.key] }))
                        }
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left active:bg-white/10"
                      >
                        <Icon
                          name="arrowRight"
                          size={11}
                          className={cn(
                            "shrink-0 text-white/40 transition-transform duration-200",
                            abierta && "rotate-90",
                          )}
                        />
                        <span className="font-display text-[0.66rem] font-bold uppercase tracking-[0.15em] text-white/55">
                          {N.sections[seccion.key as keyof typeof N.sections]}
                        </span>
                        {!seccion.live && (
                          <span className="ml-auto rounded-full bg-gold/20 px-1.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-wide text-gold">
                            {N.soon}
                          </span>
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {abierta && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="relative flex flex-col gap-0.5 pt-1">
                              {seccion.children.length === 0 ? (
                                <p className="px-3 pb-2 text-[0.78rem] leading-relaxed text-white/45">
                                  {N.emptySection}
                                </p>
                              ) : (
                                <>
                                  <span
                                    className="absolute bottom-2 left-[22px] top-1 w-px bg-gradient-to-b from-cyan-bright/50 via-cyan/20 to-gold/40"
                                    aria-hidden
                                  />
                                  {seccion.children.map((hoja) => (
                                    <DrawerItem
                                      key={hoja.key}
                                      hoja={hoja}
                                      active={
                                        hoja.exact
                                          ? pathname === hoja.href
                                          : pathname.startsWith(hoja.href)
                                      }
                                      locked={Boolean(hoja.gated) && !isMember}
                                      onNavigate={closeMenu}
                                    />
                                  ))}
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <span
              className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-cyan-bright/80 via-cyan/60 to-gold/80"
              aria-hidden
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DrawerItem({
  hoja,
  active,
  locked,
  onNavigate,
}: {
  hoja: NavLeaf;
  active: boolean;
  locked: boolean;
  onNavigate: () => void;
}) {
  const { dict } = useI18n();
  const label = dict.community.spaces[hoja.key as keyof typeof dict.community.spaces];

  return (
    <Link
      href={hoja.href}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center gap-2.5 rounded-xl py-2 pl-1.5 pr-2 transition-colors active:scale-[0.98]",
        locked && !active && "opacity-55",
      )}
    >
      {active && (
        <span
          className="absolute left-0 h-6 w-1 rounded-full bg-cyan-bright shadow-[0_0_8px_2px_rgba(34,211,238,0.7)]"
          aria-hidden
        />
      )}
      <span
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          active
            ? "border-gold/60 bg-gold text-navy shadow-[0_0_14px_2px_rgba(251,191,36,0.4)]"
            : hoja.featured
              ? "border-gold/45 bg-gold/15 text-gold"
              : "border-white/15 bg-white/[0.07] text-cyan-bright",
        )}
      >
        <Icon name={hoja.icon as IconName} size={15} />
      </span>
      <span
        className={cn(
          "min-w-0 truncate font-display text-[0.92rem] font-bold",
          active
            ? "bg-gradient-to-r from-gold to-cyan-bright bg-clip-text text-transparent"
            : hoja.featured
              ? "text-gold"
              : "text-white/85",
        )}
      >
        {label}
      </span>
      {locked && <Icon name="lock" size={12} className="ml-auto shrink-0 text-white/40" />}
    </Link>
  );
}
