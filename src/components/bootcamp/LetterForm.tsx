"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button, Input, Label, Spinner } from "@/components/ui";

/**
 * Datos para las dos cartas de invitación, pedidos DESPUÉS del pago.
 *
 * Se hace aquí y no dentro del checkout por dos motivos: Stripe admite como
 * mucho tres campos personalizados, y sobre todo, cada campo extra antes de
 * pagar pierde gente. Una vez pagado, la familia los rellena con calma — y
 * puede volver a corregirlos.
 */
export function LetterForm({ sessionId }: { sessionId: string }) {
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/bootcamp/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        participantName: f.get("participantName"),
        participantBirthdate: f.get("participantBirthdate"),
        companionName: f.get("companionName"),
        phone: f.get("phone"),
        country: f.get("country"),
      }),
    });
    setEnviando(false);
    if (res.ok) setListo(true);
    else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "No se pudieron guardar los datos.");
    }
  }

  if (listo) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Icon name="check" size={20} />
        </span>
        <p className="mt-3 font-display text-lg font-bold text-navy">
          Datos recibidos
        </p>
        <p className="mt-1 text-sm text-muted">
          Emitimos las dos cartas y te las enviamos por correo en un plazo de 7 días.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="rounded-2xl border border-surface-line bg-paper p-6">
      <h2 className="font-display text-lg font-bold text-navy">
        Datos para las cartas de invitación
      </h2>
      <p className="mt-1.5 text-sm text-muted">
        Los nombres deben ir <strong className="text-navy">exactamente como aparecen en el
        pasaporte</strong>: el consulado no acepta cartas con nombres que no coincidan.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="participantName">Nombre completo del participante</Label>
          <Input id="participantName" name="participantName" required minLength={3} />
        </div>
        <div>
          <Label htmlFor="participantBirthdate">Fecha de nacimiento</Label>
          <Input id="participantBirthdate" name="participantBirthdate" type="date" required />
        </div>
        <div>
          <Label htmlFor="country">País de residencia</Label>
          <Input id="country" name="country" required minLength={2} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="companionName">Nombre completo del acompañante</Label>
          <Input id="companionName" name="companionName" required minLength={3} />
          <p className="mt-1 text-xs text-muted">
            El adulto que viaja con el participante. Su carta va incluida.
          </p>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="phone">Teléfono con WhatsApp</Label>
          <Input id="phone" name="phone" required minLength={6} placeholder="+51 999 999 999" />
        </div>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>}

      <Button type="submit" disabled={enviando} className="mt-5">
        {enviando ? <Spinner /> : <Icon name="check" size={16} />}
        Enviar datos
      </Button>
    </form>
  );
}
