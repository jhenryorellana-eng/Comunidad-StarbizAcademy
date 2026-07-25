"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Spinner, cn } from "@/components/ui";

/**
 * Botón que abre el pago. Pide la sesión al servidor y redirige a Stripe.
 *
 * La creación de la sesión vive en el servidor —nunca en el cliente— porque
 * ahí es donde está la clave secreta y donde se fija el importe. Si el precio
 * lo pusiera el navegador, cualquiera podría cambiarlo por 1 céntimo antes de
 * enviar la petición.
 */
export function CheckoutButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pagar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/bootcamp/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo abrir el pago.");
        setCargando(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("No se pudo conectar. Revisa tu conexión.");
      setCargando(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={pagar}
        disabled={cargando}
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-semibold text-navy shadow-[0_10px_34px_rgba(251,191,36,0.4)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-300 disabled:cursor-wait disabled:opacity-70",
          className,
        )}
      >
        {cargando ? <Spinner className="text-navy" /> : null}
        {label}
        {!cargando && <Icon name="arrowRight" size={16} />}
      </button>
      {error && <p className="text-xs font-medium text-rose-300">{error}</p>}
    </div>
  );
}
