"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { buscarPaises, paisPorGentilicio, type Pais } from "@/lib/paises";

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
            ? "border-rose-400/60 bg-rose-500/10"
            : elegido
              ? "border-cyan-bright/60 bg-cyan-bright/10"
              : "border-white/15 bg-navy/40 hover:border-white/25",
        )}
      >
        {elegido ? (
          <>
            <Distintivo iso={elegido.iso} activo />
            <span className="min-w-0 flex-1 truncate text-base text-white">
              {elegido.gentilicio}
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1 text-base text-white/30">Elige un país</span>
        )}
        <Icon
          name="arrowRight"
          size={14}
          className={cn(
            "shrink-0 text-white/50 transition-transform",
            abierto ? "-rotate-90" : "rotate-90",
          )}
        />
      </button>

      {abierto && (
        <div
          id={listaId}
          className="mt-2 overflow-hidden rounded-2xl border border-cyan-bright/30 bg-[#040914]/95 shadow-[0_26px_60px_-18px_rgba(0,0,0,0.9)]"
        >
          <div className="border-b border-white/10 bg-cyan-bright/[0.06] p-2.5">
            <label className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-white/12 bg-navy/50 px-3">
              <Icon name="search" size={14} className="shrink-0 text-cyan-bright/80" />
              <input
                autoFocus
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder="Buscar país o nacionalidad…"
                /* 16px: por debajo de eso iOS hace zoom solo al enfocar. */
                className="w-full bg-transparent py-2.5 text-base text-white placeholder:text-white/30 focus:outline-none"
              />
            </label>
          </div>

          <div className="max-h-[320px] overflow-y-auto overscroll-contain">
            {resultados.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm leading-relaxed text-white/50">
                No encontramos ese país.
                <br />
                <span className="text-white/35">
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
                  <Grupo titulo={consulta ? "Otros resultados" : "Todos los países"} />
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
        <p className="mt-2 flex items-center gap-1.5 text-xs text-white/45">
          En la carta se leerá{" "}
          <strong className="font-display text-[0.78rem] font-bold text-gold-300">
            {elegido.gentilicio}
          </strong>
        </p>
      )}
    </div>
  );
}

function Grupo({ titulo, estrella }: { titulo: string; estrella?: boolean }) {
  return (
    <p className="flex items-center gap-2 px-3.5 pb-1.5 pt-3 font-display text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/35">
      {estrella && <EstrellaMarca className="h-2.5 w-2.5 text-gold" />}
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
        elegido ? "bg-cyan-bright/12" : "hover:bg-white/5",
      )}
    >
      <Distintivo iso={pais.iso} activo={elegido} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.94rem] font-semibold text-white">
          {pais.nombre}
        </span>
        <span className="block truncate text-xs text-white/45">{pais.gentilicio}</span>
      </span>
      {elegido && <EstrellaMarca className="h-4 w-4 shrink-0 text-gold" />}
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
          ? "border-cyan-bright/50 bg-cyan-bright/20 text-cyan-50"
          : "border-white/12 bg-white/[0.07] text-white/60",
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
