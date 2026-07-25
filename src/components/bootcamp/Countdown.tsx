"use client";

import { useEffect, useState } from "react";
import { countdownParts, msUntilBootcamp } from "@/lib/bootcamp";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/components/ui";

/**
 * Cuenta regresiva "T-menos" al 26 de enero de 2027.
 *
 * El valor depende del reloj del visitante, así que el servidor NO lo puede
 * renderizar: arranca en null y se llena en el primer efecto. Así no hay
 * desajuste de hidratación y el hueco no salta (se reserva la altura).
 */
function useCountdown() {
  const [parts, setParts] = useState<ReturnType<typeof countdownParts> | null>(null);

  useEffect(() => {
    const tick = () => setParts(countdownParts(msUntilBootcamp()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return parts;
}

/** Versión grande: cuatro cápsulas de vidrio sobre el cielo nocturno. */
export function Countdown({ className }: { className?: string }) {
  const parts = useCountdown();
  const { dict } = useI18n();
  const B = dict.bootcamp;

  const cells: Array<[number | null, string]> = [
    [parts?.days ?? null, B.days],
    [parts?.hours ?? null, B.hours],
    [parts?.minutes ?? null, B.minutes],
    [parts?.seconds ?? null, B.seconds],
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
      {cells.map(([value, label], i) => (
        <div
          key={label}
          className="min-w-[4.25rem] flex-1 rounded-2xl border border-white/15 bg-white/[0.07] px-3 py-2.5 text-center backdrop-blur-md sm:min-w-[5rem] sm:px-4 sm:py-3"
        >
          <div
            className={cn(
              "font-display text-2xl font-extrabold tabular-nums leading-none text-white sm:text-3xl",
              // El de los segundos late en cyan para que se vea vivo.
              i === 3 && "text-cyan-bright",
            )}
          >
            {value === null ? "––" : String(value).padStart(2, "0")}
          </div>
          <div className="mt-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/55">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Versión compacta de una línea, para la cinta superior. */
export function CountdownInline() {
  const parts = useCountdown();
  const { dict } = useI18n();
  const B = dict.bootcamp;

  if (!parts) return <span className="tabular-nums opacity-60">··</span>;
  if (parts.done) return <span className="font-bold">{B.liveNow}</span>;

  return (
    <span className="tabular-nums font-bold">
      {parts.days}
      <span className="opacity-70">{B.dayShort}</span> {String(parts.hours).padStart(2, "0")}
      <span className="opacity-70">{B.hourShort}</span> {String(parts.minutes).padStart(2, "0")}
      <span className="opacity-70">{B.minShort}</span>
    </span>
  );
}
