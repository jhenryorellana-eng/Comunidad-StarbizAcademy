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

   Vidrio esmerilado a media pantalla de ancho y completa de alto. La página
   sigue viéndose detrás, difuminada.

   Por qué se mueve así:

   · UN SOLO GESTO. La lámina entra como un único objeto con muelle, con el
     punto de origen puesto en el botón: nace de ahí y vuelve ahí. Sin barridos
     ni recortes — un borde de recorte cruzando la tipografía es justo lo que
     hace que una transición se vea barata.
   · NADA DE `filter: blur` ANIMADO. Desenfocar por fotograma es de lo más caro
     que hay en móvil y se pinta a saltos. El contenido sólo funde opacidad y
     un desplazamiento de 6 px, que el compositor resuelve en la GPU.
   · CONTENIDO Y LÁMINA NO VIAJAN JUNTOS. Al abrir llega antes la lámina; al
     cerrar el contenido se va primero. Ese desfase es lo que da materia.
   · CERRAR SIEMPRE MÁS RÁPIDO QUE ABRIR. Esperar a que algo desaparezca irrita.
=========================================================================== */

/** Ancho: la MITAD exacta de la pantalla. El mínimo sólo actúa en móviles muy
    estrechos (<420px), donde si no las etiquetas se cortarían. */
const PANEL_W = "w-[50vw] min-w-[210px] max-w-[340px]";

/** Curva de salida larga: arranca rápido y se posa. */
const SOFT = [0.22, 1, 0.36, 1] as const;
/** Despliegue de la lámina. Con curva, no con muelle: un muelle sobre una
    geometría de recorte puede pasarse de largo y generar valores inválidos.
    La curva arranca despacio a propósito: con una salida muy adelantada el
    panel ya estaba medio abierto en 60 ms y no daba tiempo a leer que la forma
    de partida ES el botón. */
const UNFOLD = { duration: 0.56, ease: [0.42, 0, 0.14, 1] } as const;
/** Cierre: corto y decidido. */
const EXIT = { duration: 0.3, ease: [0.55, 0, 1, 0.45] } as const;

/** Medio lado del botón de menú (h-9 w-9 → 36px). */
const BTN_HALF = 18;
/** Radio del botón (rounded-xl) y del panel abierto. */
const BTN_RADIUS = 12;
const PANEL_RADIUS = 28;

/**
 * Recorte con forma de la CAJA DEL BOTÓN dentro del panel.
 *
 * El panel está anclado en (0,0), así que las coordenadas de viewport valen
 * tal cual. Se anima `inset()` —un rectángulo redondeado— en vez de `circle()`:
 * un círculo creciendo deja ver el arco barriendo la tipografía, que es la
 * marca de una transición barata. Un rectángulo que crece se lee como el
 * propio botón expandiéndose.
 */
function buttonClip(ox: number, oy: number, panelW: number, panelH: number): string {
  const top = Math.max(0, oy - BTN_HALF);
  const left = Math.max(0, ox - BTN_HALF);
  const right = Math.max(0, panelW - (ox + BTN_HALF));
  const bottom = Math.max(0, panelH - (oy + BTN_HALF));
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${BTN_RADIUS}px ${BTN_RADIUS}px ${BTN_RADIUS}px ${BTN_RADIUS}px)`;
}

/** Recorte del panel entero: sólo redondeado por la derecha. */
const FULL_CLIP = `inset(0px 0px 0px 0px round 0px ${PANEL_RADIUS}px ${PANEL_RADIUS}px 0px)`;

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
    document.body.style.overflow = "hidden";
    return () => {
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

  // Medidas del panel para construir el recorte. Se leen del navegador porque
  // el ancho depende de `50vw` con topes; el subárbol sólo se monta en cliente
  // (open arranca en false), así que el valor de reserva nunca llega a verse.
  const vw = typeof window === "undefined" ? 390 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const panelW = Math.min(340, Math.max(210, vw * 0.5));
  const seedClip = buttonClip(origin.x, origin.y, panelW, vh);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Velo muy leve: el vidrio pierde la gracia si tapa la página. */}
          <motion.div
            className="absolute inset-0 bg-navy/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.35, ease: SOFT } }}
            exit={{ opacity: 0, transition: EXIT }}
            onClick={closeMenu}
          />

          {/* LA LÁMINA — un solo objeto, un solo muelle. */}
          <motion.div
            className={cn(
              "absolute left-0 top-0 flex h-full flex-col overflow-hidden rounded-r-[28px]",
              // El vidrio pasó de blur-2xl (40px) a blur-lg (16px) y el fondo
              // de 50% a 75% de opacidad. El coste de `backdrop-filter` crece
              // con el radio, y con el fondo más opaco el resultado se lee casi
              // igual: sigue viéndose la página detrás, difuminada.
              "border-r border-white/[0.18] bg-navy/75 backdrop-blur-lg",
              "shadow-[18px_0_60px_-12px_rgba(6,10,24,0.55)]",
              PANEL_W,
            )}
            // Sin `willChange` a mano: motion promueve la capa durante la
            // animación y la libera al acabar. Fijarlo aquí dejaba la capa
            // promovida todo el rato, y sumado al backdrop-filter era caro.
            // Arranca siendo EXACTAMENTE la caja del botón y crece hasta el
            // panel; al cerrar hace el camino inverso y se recoge en el botón.
            initial={{ clipPath: seedClip, opacity: 0 }}
            animate={{
              clipPath: FULL_CLIP,
              opacity: 1,
              transition: { ...UNFOLD, opacity: { duration: 0.12, ease: "linear" } },
            }}
            exit={{
              clipPath: seedClip,
              opacity: 0,
              transition: { ...EXIT, opacity: { duration: 0.12, delay: 0.18, ease: "linear" } },
            }}
          >
            {/* Aquí vivía un <NightSky /> entero: unas cuarenta animaciones
                infinitas DENTRO de un contenedor con `backdrop-filter`. Esa
                combinación es la peor posible — el navegador tiene que rehacer
                el desenfoque en cada fotograma mientras algo se mueva detrás, y
                no para mientras el menú esté abierto. Detrás de un cristal de
                50vw las estrellas apenas se distinguían. Se sustituyen por dos
                resplandores fijos, que es lo que de verdad se veía. */}
            <span
              className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-cyan-bright/15 blur-3xl"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gold/10 blur-3xl"
              aria-hidden
            />

            {/* Reflejo especular del cristal: una banda de luz muy tenue en el
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
              style={{ transformOrigin: at }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { duration: 0.34, ease: SOFT, delay: 0.2 },
              }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12, ease: "linear" } }}
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
                  {items.map((it, i) => (
                    <motion.div
                      key={it.key}
                      // Sólo opacidad y 6 px: todo compuesto en GPU, sin repintar.
                      initial={{ opacity: 0, y: 6 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.34, ease: SOFT, delay: 0.26 + i * 0.03 },
                      }}
                    >
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
                    </motion.div>
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
