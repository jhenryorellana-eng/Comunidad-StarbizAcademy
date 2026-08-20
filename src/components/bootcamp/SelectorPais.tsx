"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { buscarPaises, paisPorGentilicio, PAISES, type Pais } from "@/lib/paises";

/**
 * Selector de nacionalidad.
 *
 * SE DESPLIEGA EN EL SITIO, no en un modal. En una pantalla de teléfono un
 * modal para elegir una cosa es un paso de más: hay que abrirlo, elegir y
 * cerrarlo, y mientras tanto tapa lo que estabas rellenando. Aquí la lista
 * empuja el contenido hacia abajo y se cierra sola al elegir.
 *
 * LOS FRECUENTES ARRIBA. Seis países cubren casi todo el grupo; el resto vive
 * detrás del buscador. Ordenar alfabéticamente los veintidós obligaría a casi
 * todo el mundo a desplazarse para encontrar el suyo.
 *
 * Lo que se guarda es el GENTILICIO ("Peruana"), que es la forma que se imprime
 * en la carta. Ver `lib/paises.ts` para el porqué.
 */
export function SelectorPais({
  value,
  onChange,
  error,
  describedBy,
}: {
  value: string | null;
  onChange: (p: Pais) => void;
  error?: boolean;
  describedBy?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const caja = useRef<HTMLDivElement>(null);
  const listaId = useId();

  const elegido = paisPorGentilicio(value);
  const resultados = buscarPaises(consulta);
  const frecuentes = resultados.filter((p) => p.frecuente);
  const resto = resultados.filter((p) => !p.frecuente);

  // Escape cierra, y un clic fuera también. Sin esto la lista se queda abierta
  // ocupando media pantalla cuando alguien se arrepiente.
  useEffect(() => {
    if (!abierto) return;
    function alPulsar(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    function alTocarFuera(e: MouseEvent) {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("keydown", alPulsar);
    document.addEventListener("mousedown", alTocarFuera);
    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.removeEventListener("mousedown", alTocarFuera);
    };
  }, [abierto]);

  function elegir(p: Pais) {
    onChange(p);
    setConsulta("");
    setAbierto(false);
  }

  return (
    <div ref={caja}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={abierto ? listaId : undefined}
        aria-describedby={describedBy}
        className={cn(
          "flex min-h-[50px] w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
          error
            ? "border-rose-400 bg-rose-50"
            : elegido
              ? "border-ocaso bg-ocaso-suave"
              : "border-arena-linea bg-paper hover:border-arena-punteada",
        )}
      >
        {elegido ? (
          <>
            <Distintivo iso={elegido.iso} activo />
            <span className="min-w-0 flex-1 truncate text-base text-navy">
              {elegido.gentilicio}
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1 text-base text-arena-tinta">Elige un país</span>
        )}
        <Icon
          name="arrowRight"
          size={14}
          className={cn(
            "shrink-0 text-arena-tinta transition-transform",
            abierto ? "-rotate-90" : "rotate-90",
          )}
        />
      </button>

      {abierto && (
        <div
          id={listaId}
          className="mt-2 overflow-hidden rounded-2xl border border-ocaso-vivo bg-paper shadow-[0_20px_48px_-24px_rgba(120,60,20,0.5)] ring-[3px] ring-ocaso-vivo/15"
        >
          <div className="border-b border-ocaso-borde bg-ocaso-suave p-2.5">
            <label className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-arena-linea bg-paper px-3">
              <Icon name="search" size={14} className="shrink-0 text-ocaso" />
              <input
                autoFocus
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder="Buscar país o nacionalidad…"
                /* 16px: por debajo de eso iOS hace zoom solo al enfocar. */
                className="w-full bg-transparent py-2.5 text-base text-navy placeholder:text-arena-tinta focus:outline-none"
              />
            </label>
          </div>

          <div className="max-h-[320px] overflow-y-auto overscroll-contain">
            {resultados.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm leading-relaxed text-arena-texto">
                No encontramos ese país.
                <br />
                <span className="text-arena-tinta">
                  Escríbenos y lo añadimos — no te quedes aquí atascado.
                </span>
              </p>
            ) : (
              <>
                {frecuentes.length > 0 && (
                  <Grupo titulo="De donde viene casi todo el grupo" estrella />
                )}
                {frecuentes.map((p) => (
                  <Fila
                    key={p.iso}
                    pais={p}
                    elegido={p.iso === elegido?.iso}
                    onClick={() => elegir(p)}
                  />
                ))}

                {resto.length > 0 && (
                  <Grupo titulo={consulta ? "Otros resultados" : `Los otros ${resto.length}`} />
                )}
                {resto.map((p) => (
                  <Fila
                    key={p.iso}
                    pais={p}
                    elegido={p.iso === elegido?.iso}
                    onClick={() => elegir(p)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Lo que de verdad importa de este campo: cómo saldrá impreso. */}
      {elegido && !abierto && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-arena-texto">
          En la carta se leerá{" "}
          <strong className="font-display text-[0.78rem] font-bold text-ocaso">
            {elegido.gentilicio}
          </strong>
        </p>
      )}
    </div>
  );
}

function Grupo({ titulo, estrella }: { titulo: string; estrella?: boolean }) {
  return (
    <p className="flex items-center gap-2 px-3.5 pb-1.5 pt-3 font-display text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-arena-tinta">
      {estrella && <EstrellaMarca className="h-2.5 w-2.5 text-ocaso-vivo" />}
      {titulo}
    </p>
  );
}

function Fila({
  pais,
  elegido,
  onClick,
}: {
  pais: Pais;
  elegido: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={elegido}
      className={cn(
        "flex min-h-[52px] w-full items-center gap-3 px-3.5 py-2 text-left transition-colors",
        elegido ? "bg-ocaso-suave" : "hover:bg-arena",
      )}
    >
      <Distintivo iso={pais.iso} activo={elegido} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.94rem] font-semibold text-navy">{pais.nombre}</span>
        <span className="block truncate text-xs text-arena-tinta">{pais.gentilicio}</span>
      </span>
      {elegido && <EstrellaMarca className="h-4 w-4 shrink-0 text-ocaso-vivo" />}
    </button>
  );
}

/** El código ISO en una placa. Se evitan banderas emoji: se ven distintas en
    cada sistema y ninguna encaja con el resto de la interfaz. */
function Distintivo({ iso, activo }: { iso: string; activo?: boolean }) {
  return (
    <span
      className={cn(
        "flex h-6 w-8 shrink-0 items-center justify-center rounded-md border text-[0.62rem] font-bold tracking-wider",
        activo
          ? "border-ocaso bg-ocaso text-white"
          : "border-arena-linea bg-arena text-arena-texto",
      )}
    >
      {iso}
    </span>
  );
}

/** La estrella de cuatro puntas de la marca, la misma del logo. */
export function EstrellaMarca({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" className={className} aria-hidden>
      <path d="M20 7 L23 17 L33 20 L23 23 L20 33 L17 23 L7 20 L17 17 Z" />
    </svg>
  );
}

export const TOTAL_PAISES = PAISES.length;
