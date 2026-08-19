"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Spinner, cn } from "@/components/ui";
import type { EstadoBootcamp } from "@/lib/bootcampAccess";

/**
 * La llamada a reservar cupo.
 *
 * Ya no es un botón: es cinco respuestas distintas a la misma pregunta, según
 * quién mire. El estado lo resuelve el servidor (`lib/bootcampAccess`) y llega
 * aquí decidido — calcularlo en el cliente daría un parpadeo entre lo primero
 * que se pinta y lo que resulta ser verdad.
 *
 * PAGA EL PADRE Y PAGA POR UN HIJO CONCRETO. Por eso, con más de un hijo, hay
 * que elegir antes: el cupo es nominal y de esa elección salen el nombre y la
 * fecha de nacimiento de la carta de invitación.
 */
const BASE =
  "inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition-all duration-200 hover:-translate-y-px";
const ORO = "bg-gold text-navy shadow-[0_10px_34px_rgba(251,191,36,0.4)] hover:bg-gold-300";

export function CheckoutButton({
  label,
  estado,
  className,
}: {
  label: string;
  estado: EstadoBootcamp;
  className?: string;
}) {
  const [cargando, setCargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pagar(childId: string) {
    setCargando(childId);
    setError(null);
    try {
      const res = await fetch("/api/bootcamp/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo abrir el pago.");
        setCargando(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("No se pudo conectar. Revisa tu conexión.");
      setCargando(null);
    }
  }

  // ── Sin cuenta ─────────────────────────────────────────────────────────
  if (estado.tipo === "invitado") {
    return (
      <div className={cn("inline-flex flex-col items-start gap-2", className)}>
        <Link href="/signup" className={cn(BASE, ORO)}>
          Crear cuenta y reservar
          <Icon name="arrowRight" size={16} />
        </Link>
        <p className="text-xs text-white/45">
          El cupo lo reserva mamá, papá o tutor · gratis, 30 segundos
        </p>
      </div>
    );
  }

  // ── Es el chico, no puede pagar ────────────────────────────────────────
  if (estado.tipo === "menor") {
    return (
      <div className={cn("inline-flex flex-col items-start gap-2", className)}>
        <span className={cn(BASE, "cursor-default bg-white/10 text-white/70")}>
          <Icon name="lock" size={15} />
          Que lo reserve tu papá o tu mamá
        </span>
        <p className="text-xs text-white/45">
          El cupo se paga desde su cuenta — enséñale esta página.
        </p>
      </div>
    );
  }

  // ── Padre sin hijos dados de alta ──────────────────────────────────────
  if (estado.tipo === "sin-hijos") {
    return (
      <div className={cn("inline-flex flex-col items-start gap-2", className)}>
        <Link href="/familia" className={cn(BASE, ORO)}>
          Registrar a mi hijo/a
          <Icon name="arrowRight" size={16} />
        </Link>
        <p className="text-xs text-white/45">
          El cupo es nominal: primero su cuenta, después la reserva.
        </p>
      </div>
    );
  }

  // ── Ya están todos inscritos ───────────────────────────────────────────
  if (estado.tipo === "todos-inscritos") {
    return (
      <div className={cn("inline-flex flex-col items-start gap-2", className)}>
        <span className={cn(BASE, "cursor-default bg-emerald-500 text-white")}>
          <Icon name="check" size={16} />
          {estado.nombres.length === 1
            ? `${estado.nombres[0]} ya tiene su cupo`
            : "Ya tienen su cupo"}
        </span>
        <Link href="/familia" className="text-xs text-white/55 underline-offset-4 hover:underline">
          Ver el estado en Mi familia
        </Link>
      </div>
    );
  }

  // ── Un solo hijo: directo al pago ──────────────────────────────────────
  if (estado.hijos.length === 1) {
    const h = estado.hijos[0];
    return (
      <div className={cn("inline-flex flex-col items-start gap-2", className)}>
        <button
          type="button"
          onClick={() => pagar(h.id)}
          disabled={cargando !== null}
          className={cn(BASE, ORO, "disabled:cursor-wait disabled:opacity-70")}
        >
          {cargando ? <Spinner className="text-navy" /> : null}
          {label} para {h.name.split(" ")[0]}
          {!cargando && <Icon name="arrowRight" size={16} />}
        </button>
        {error && <p className="text-xs font-medium text-rose-300">{error}</p>}
      </div>
    );
  }

  // ── Varios hijos: hay que elegir ───────────────────────────────────────
  return (
    <div className={cn("flex flex-col items-start gap-2.5", className)}>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold">
        ¿Para quién reservas?
      </p>
      <div className="flex flex-wrap gap-2">
        {estado.hijos.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => pagar(h.id)}
            disabled={cargando !== null}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-5 py-2.5 font-semibold text-gold transition-all duration-200",
              "hover:-translate-y-px hover:bg-gold hover:text-navy",
              "disabled:cursor-wait disabled:opacity-60",
            )}
          >
            {cargando === h.id ? <Spinner /> : <Icon name="star" size={14} />}
            {h.name}
            {h.edad !== null && (
              <span className="text-[0.7rem] font-normal opacity-70">{h.edad} años</span>
            )}
          </button>
        ))}
      </div>
      {error && <p className="text-xs font-medium text-rose-300">{error}</p>}
    </div>
  );
}
