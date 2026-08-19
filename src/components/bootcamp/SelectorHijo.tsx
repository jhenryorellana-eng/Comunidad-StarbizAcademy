"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Spinner, cn } from "@/components/ui";
import type { EstadoBootcamp } from "@/lib/bootcampAccess";

/**
 * Elegir a quién le reservas, y confirmar.
 *
 * DOS PASOS SEPARADOS a propósito: primero se selecciona, después se confirma.
 * Con un botón de pago por hijo, un dedo torpe en el móvil manda a pagar por el
 * hermano equivocado — y eso, con un cupo nominal del que salen dos cartas de
 * invitación con nombre de pasaporte, no se arregla con un "perdón".
 *
 * Con un solo hijo la selección viene hecha: no se le pide a nadie que elija
 * entre una sola opción.
 */
export function SelectorHijo({ estado }: { estado: EstadoBootcamp }) {
  const unico = estado.tipo === "elegir" && estado.hijos.length === 1;
  const [elegido, setElegido] = useState<string | null>(
    unico && estado.tipo === "elegir" ? estado.hijos[0].id : null,
  );
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pagar() {
    if (!elegido) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/bootcamp/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId: elegido }),
      });
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

  // ── Sin cuenta ──────────────────────────────────────────────────────────
  if (estado.tipo === "invitado") {
    return (
      <Aviso
        icono="members"
        titulo="Primero, tu cuenta"
        cuerpo="El cupo lo reserva mamá, papá o tutor, y queda a nombre de tu hijo. Crear la cuenta es gratis y toma medio minuto."
        accion={{ href: "/signup", texto: "Crear mi cuenta" }}
      />
    );
  }

  // ── Es el chico ─────────────────────────────────────────────────────────
  if (estado.tipo === "menor") {
    return (
      <Aviso
        icono="lock"
        titulo="Esto lo reserva tu papá o tu mamá"
        cuerpo="El cupo se paga desde su cuenta, porque de ahí salen las cartas de invitación para el consulado. Enséñale esta página."
        accion={{ href: "/bootcamp", texto: "Ver el programa" }}
      />
    );
  }

  // ── Padre sin hijos dados de alta ───────────────────────────────────────
  if (estado.tipo === "sin-hijos") {
    return (
      <Aviso
        icono="plus"
        titulo="¿Para quién es el cupo?"
        cuerpo="Todavía no has registrado a ningún CEO Junior. El cupo es nominal: de su nombre y su fecha de nacimiento salen las dos cartas de invitación, así que primero necesita su cuenta."
        accion={{ href: "/familia", texto: "Registrar a mi hijo/a" }}
      />
    );
  }

  // ── Todos inscritos ─────────────────────────────────────────────────────
  if (estado.tipo === "todos-inscritos") {
    return (
      <Aviso
        icono="check"
        tono="ok"
        titulo={
          estado.nombres.length === 1
            ? `${estado.nombres[0]} ya tiene su cupo`
            : "Ya tienen su cupo"
        }
        cuerpo="Estamos preparando las cartas de invitación. Te llegan por correo, y con ellas se agenda la cita del consulado."
        accion={{ href: "/familia", texto: "Ver Mi familia" }}
      />
    );
  }

  // ── Elegir ──────────────────────────────────────────────────────────────
  const seleccionado = estado.hijos.find((h) => h.id === elegido);

  return (
    <div>
      <h2 className="font-display text-xl font-extrabold text-navy sm:text-2xl">
        {unico ? "Confirma la reserva" : "¿Quién viaja a Utah?"}
      </h2>
      <p className="mt-1.5 text-sm text-muted">
        {unico
          ? "El cupo queda a su nombre. Revísalo antes de pagar."
          : "Elige a uno. El cupo es nominal y de ahí salen las dos cartas de invitación."}
      </p>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {estado.hijos.map((h) => {
          const activo = h.id === elegido;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => setElegido(h.id)}
              aria-pressed={activo}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
                activo
                  ? "border-cyan bg-cyan-50/70 shadow-[0_8px_24px_-10px_rgba(8,145,178,0.5)]"
                  : "border-surface-line bg-paper hover:-translate-y-0.5 hover:border-cyan/35",
              )}
            >
              {/* La selección se ve DOS veces —marca y borde— porque con un solo
                  indicador de color, quien no distingue bien los tonos no sabe
                  cuál eligió. */}
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  activo
                    ? "border-cyan bg-cyan text-white"
                    : "border-surface-line bg-surface text-navy/40",
                )}
              >
                {activo ? (
                  <Icon name="check" size={17} />
                ) : (
                  <span className="font-display text-sm font-bold">{h.name.charAt(0)}</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display font-bold text-navy">
                  {h.name}
                </span>
                {h.edad !== null && <span className="text-xs text-muted">{h.edad} años</span>}
              </span>
            </button>
          );
        })}
      </div>

      {/* El resumen sólo aparece cuando hay a quién resumir. */}
      {seleccionado && (
        <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/[0.06] p-4">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-gold-700">
            Vas a reservar
          </p>
          <p className="mt-1.5 font-display text-lg font-bold text-navy">
            Un cupo para {seleccionado.name}
          </p>
          <p className="mt-1 text-sm text-muted">
            Bootcamp Utah 2027 · 26 al 31 de enero · $250 USD
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
          <Icon name="clock" size={14} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={pagar}
        disabled={!elegido || cargando}
        className={cn(
          "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 font-semibold transition-all duration-200 sm:w-auto",
          elegido
            ? "bg-gold text-navy shadow-[0_10px_30px_rgba(251,191,36,0.4)] hover:-translate-y-px hover:bg-gold-300"
            : "cursor-not-allowed bg-navy/[0.08] text-navy/35",
          cargando && "cursor-wait opacity-70",
        )}
      >
        {cargando ? <Spinner className="text-navy" /> : <Icon name="lock" size={15} />}
        {elegido ? "Confirmar y pagar $250" : "Elige a quién le reservas"}
      </button>

      <p className="mt-3 text-xs text-muted">
        Te llevamos a Stripe para pagar. Los datos de tu tarjeta nunca pasan por
        nuestros servidores.
      </p>
    </div>
  );
}

/** Los cuatro caminos que no llevan al pago comparten forma: qué pasa, por qué,
    y una sola salida. Sin botones que no se puedan pulsar. */
function Aviso({
  icono,
  titulo,
  cuerpo,
  accion,
  tono,
}: {
  icono: "members" | "lock" | "plus" | "check";
  titulo: string;
  cuerpo: string;
  accion: { href: string; texto: string };
  tono?: "ok";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 sm:p-8",
        tono === "ok" ? "border-emerald-200 bg-emerald-50/60" : "border-surface-line bg-paper",
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl",
          tono === "ok" ? "bg-emerald-500 text-white" : "bg-navy text-gold",
        )}
      >
        <Icon name={icono} size={22} />
      </span>
      <h2 className="mt-4 font-display text-xl font-extrabold text-navy">{titulo}</h2>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-muted">{cuerpo}</p>
      <Link
        href={accion.href}
        className={cn(
          "mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-all duration-200 hover:-translate-y-px",
          tono === "ok"
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-navy text-white hover:bg-navy-800",
        )}
      >
        {accion.texto}
        <Icon name="arrowRight" size={15} />
      </Link>
    </div>
  );
}
