"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { COMMUNITY_SPACES } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/components/ui";
import { useCommunityNav } from "./navContext";

/* ===========================================================================
   MENÚ DE LA COMUNIDAD (móvil)

   Lámina a media pantalla de ancho y completa de alto, que brota del botón.

   REGLA DE ORO: durante el gesto sólo se animan `transform` y `opacity`.
   Son las dos únicas propiedades que el navegador resuelve moviendo una
   textura ya pintada. Todo lo demás —clip-path, filter, backdrop-filter,
   box-shadow, width/height— obliga a repintar en cada fotograma, y en un móvil
   eso se ve como tirones. La primera versión animaba `clip-path` sobre un
   elemento con `backdrop-filter`, que es la peor combinación de las dos listas.

   Lo demás sigue igual que antes:

   · UN SOLO GESTO. La lámina entra como un único objeto, con el origen puesto
     en el botón: nace de ahí y vuelve ahí.
   · CONTENIDO Y LÁMINA NO VIAJAN JUNTOS. Al abrir llega antes la lámina; al
     cerrar el contenido se va primero. Ese desfase es lo que da materia.
   · CERRAR SIEMPRE MÁS RÁPIDO QUE ABRIR. Esperar a que algo desaparezca irrita.
=========================================================================== */

/** Ancho: la MITAD exacta de la pantalla. El mínimo sólo actúa en móviles muy
    estrechos (<420px), donde si no las etiquetas se cortarían. */
const PANEL_W = "w-[50vw] min-w-[210px] max-w-[340px]";

/** Curva de salida larga: arranca rápido y se posa. */
const SOFT = [0.22, 1, 0.36, 1] as const;
/** Apertura. 0.20s, no 0.42s.
    Lo que se percibía como lentitud no eran fotogramas perdidos: era que el
    menú tardaba en poder LEERSE. El panel crecía 0.42s y el texto empezaba a
    entrar a los 0.22s, así que hasta pasados ~0.42s no había nada legible.
    Medio segundo después del toque es una eternidad para un menú. */
const UNFOLD = { duration: 0.2, ease: [0.16, 1, 0.3, 1] } as const;
/** Cierre: aún más corto. Esperar a que algo desaparezca irrita más que
    esperar a que aparezca. */
const EXIT = { duration: 0.14, ease: [0.4, 0, 1, 0.6] } as const;

type Item = {
  key: string;
  href: string;
  icon: IconName;
  label: string;
  active: boolean;
  locked: boolean;
};

export function CommunityNavDrawer() {
  const { dict } = useI18n();
  const pathname = usePathname();
  const { open, isMember, origin, closeMenu } = useCommunityNav();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    // El bloqueo del scroll se aplaza un fotograma a propósito. Cambiar
    // `overflow` en el body invalida la disposición de TODO el documento, y
    // hacerlo en el mismo fotograma del toque obliga al navegador a recalcular
    // el feed entero justo cuando debería estar arrancando la animación. Un
    // fotograma después, el gesto ya está en marcha y el recálculo no compite
    // con él.
    const rafId = requestAnimationFrame(() => {
      document.body.style.overflow = "hidden";
    });
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeMenu]);

  const items: Item[] = COMMUNITY_SPACES.map((s) => ({
    key: s.key,
    href: s.href,
    icon: s.icon as IconName,
    label: dict.community.spaces[s.key as keyof typeof dict.community.spaces],
    active: pathname.startsWith(s.href),
    locked: s.gated && !isMember,
  }));

  // El origen del gesto es el botón: la lámina crece desde ahí y se recoge ahí.
  const at = `${origin.x}px ${origin.y}px`;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Velo muy leve: el vidrio pierde la gracia si tapa la página. */}
          <motion.div
            className="absolute inset-0 bg-navy/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.26, ease: SOFT } }}
            exit={{ opacity: 0, transition: EXIT }}
            onClick={closeMenu}
          />

          {/* LA LÁMINA — un solo objeto, un solo gesto.

              Antes esto animaba `clip-path` sobre un elemento con
              `backdrop-filter`. Esa pareja NO se puede componer en GPU: cada
              fotograma obliga a muestrear el fondo, desenfocarlo y recortarlo
              con la geometría nueva. Bajar el radio del desenfoque abarataba el
              trabajo, pero el trabajo seguía ahí — y se notaba.

              Ahora sólo se animan `transform` y `opacity`, las dos únicas
              propiedades que nunca repintan, con el origen puesto en el botón.
              Es exactamente la técnica de los menús contextuales de iOS: la
              lámina brota del botón y se recoge en él, pero el navegador sólo
              tiene que mover una textura ya pintada. */}
          <motion.div
            className={cn(
              "absolute left-0 top-0 flex h-full flex-col overflow-hidden rounded-r-[28px]",
              // Degradado sólido en vez de vidrio. En un panel navy oscuro se
              // lee prácticamente igual que el 75% + desenfoque que había, y
              // deja de costar por fotograma. El velo de detrás se oscureció un
              // punto para compensar la separación que daba el difuminado.
              "border-r border-white/[0.18]",
              // Los dos resplandores (cyan abajo-izquierda, dorado arriba-derecha)
              // van como degradados radiales del propio fondo. Antes eran dos
              // <span> con `blur-3xl`: un filtro de 64px dentro de una capa que
              // escala puede forzar a re-rasterizar durante el gesto. Un
              // degradado es parte de la textura y no cuesta nada.
              "bg-[radial-gradient(120%_60%_at_0%_100%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(90%_45%_at_100%_0%,rgba(251,191,36,0.12),transparent_62%),linear-gradient(158deg,#12203c_0%,#0d1830_46%,#0a1020_100%)]",
              "shadow-[18px_0_60px_-12px_rgba(6,10,24,0.6)]",
              PANEL_W,
            )}
            // Escala 0.92 -> 1, no 0.16 -> 1. Ampliar seis veces obliga al
            // navegador a estirar una textura rasterizada a tamaño pequeño: el
            // panel se ve blando mientras crece y se endurece de golpe al
            // final. No es un tirón, pero se lee igual de mal. Con el origen en
            // el botón, un empujón corto desde ahí basta para que se entienda
            // de dónde sale — y llega nítido desde el primer fotograma.
            style={{ transformOrigin: at }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: UNFOLD }}
            exit={{ opacity: 0, scale: 0.94, transition: EXIT }}
          >
            {/* Reflejo especular: una banda de luz muy tenue en el
                borde superior. Es lo que separa un panel translúcido de uno que
                parece vidrio de verdad. */}
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-24"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 100%)",
              }}
              aria-hidden
            />

            {/* CONTENIDO — llega después de la lámina y se va antes que ella. */}
            <motion.div
              className="relative flex min-h-0 flex-1 flex-col"
              // Se despliega CON la lámina, tirando desde el botón, y no
              // aparece hasta que la forma ya creció (si no, se leería texto
              // dentro de un cuadradito del tamaño del botón).
              // Sin retraso. Antes esperaba 0.22s a que la lámina creciera, y
              // ese hueco era la mayor parte de la lentitud percibida. Ahora
              // entra con ella: el menú se puede leer a los ~0.15s del toque.
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

              <div className="relative mt-3 min-h-0 flex-1 overflow-y-auto px-3 pb-6">
                <span
                  className="absolute bottom-6 left-[34px] top-3 w-px bg-gradient-to-b from-cyan-bright/60 via-cyan/30 to-gold/50"
                  aria-hidden
                />
                <nav className="flex flex-col gap-0.5">
                  {/* Sin escalonado por item. Antes cada uno llevaba su propia
                      animación: seis cálculos más por fotograma en el hilo
                      principal, justo mientras la lámina crece. A 200 ms el
                      desfase no se percibía — sólo estorbaba. El contenido
                      entra como un bloque, con el fundido del padre. */}
                  {items.map((it) => (
                    <div key={it.key}>
                      <Link
                        href={it.href}
                        onClick={closeMenu}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl py-2.5 pl-1.5 pr-2 transition-colors active:scale-[0.98]",
                          it.locked && !it.active && "opacity-55",
                        )}
                      >
                        {it.active && (
                          <span
                            className="absolute left-0 h-6 w-1 rounded-full bg-cyan-bright shadow-[0_0_8px_2px_rgba(34,211,238,0.7)]"
                            aria-hidden
                          />
                        )}
                        <span
                          className={cn(
                            "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                            it.active
                              ? "border-gold/60 bg-gold text-navy shadow-[0_0_14px_2px_rgba(251,191,36,0.4)]"
                              : "border-white/15 bg-white/[0.07] text-cyan-bright",
                          )}
                        >
                          <Icon name={it.icon} size={16} />
                        </span>
                        <span
                          className={cn(
                            "min-w-0 truncate font-display text-[0.98rem] font-bold",
                            it.active
                              ? "bg-gradient-to-r from-gold to-cyan-bright bg-clip-text text-transparent"
                              : "text-white/85",
                          )}
                        >
                          {it.label}
                        </span>
                        {it.locked && (
                          <Icon name="lock" size={12} className="ml-auto shrink-0 text-white/40" />
                        )}
                      </Link>
                    </div>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Filo de marca en el canto derecho: cyan → dorado, muy fino. */}
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
