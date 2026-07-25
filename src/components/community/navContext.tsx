"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Punto de la pantalla del que nace el panel — y al que vuelve al cerrarse. */
export type Origin = { x: number; y: number };

type NavCtx = {
  open: boolean;
  isMember: boolean;
  /** Centro del botón que abrió el menú, en coordenadas de viewport. */
  origin: Origin;
  openMenu: (origin?: Origin) => void;
  closeMenu: () => void;
};

/** Aproximación si el botón no reportó su posición (p. ej. atajo de teclado). */
const FALLBACK_ORIGIN: Origin = { x: 28, y: 112 };

const Ctx = createContext<NavCtx | null>(null);

export function useCommunityNav(): NavCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCommunityNav debe usarse dentro de <CommunityNavProvider>");
  return ctx;
}

/**
 * Estado compartido entre el botón (vive DENTRO de la barra de secciones) y el
 * panel (vive fuera, porque la barra tiene backdrop-blur y eso atraparía a un
 * hijo `position: fixed`).
 */
export function CommunityNavProvider({
  isMember,
  children,
}: {
  isMember: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Se guarda la ruta en la que se abrió: al navegar, `open` pasa a false solo,
  // sin necesidad de un efecto que haga setState.
  const [state, setState] = useState<{ open: boolean; path: string; origin: Origin }>({
    open: false,
    path: "",
    origin: FALLBACK_ORIGIN,
  });
  const open = state.open && state.path === pathname;

  const value = useMemo<NavCtx>(
    () => ({
      open,
      isMember,
      origin: state.origin,
      openMenu: (origin) =>
        setState({ open: true, path: pathname, origin: origin ?? FALLBACK_ORIGIN }),
      closeMenu: () => setState((s) => ({ ...s, open: false, path: pathname })),
    }),
    [open, isMember, pathname, state.origin],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
