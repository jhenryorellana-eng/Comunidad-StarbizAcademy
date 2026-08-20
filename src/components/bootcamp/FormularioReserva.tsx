"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { Input, Label, Spinner, cn } from "@/components/ui";
import { BOOTCAMP } from "@/lib/bootcamp";

/**
 * El formulario de reserva. Sin cuenta, sin fricción previa.
 *
 * Se llega desde un anuncio y se compra: por eso no hay registro delante. Lo
 * único que separa el clic del pago son estos campos, y cada uno está aquí por
 * un motivo concreto — el consulado los coteja o la carta los lleva impresos.
 *
 * SE GUARDA ANTES DE PAGAR. La reserva nace en PENDING y sólo entonces se abre
 * Stripe. Si alguien abandona en la pasarela, el contacto ya está a salvo: es
 * el interesado más caliente que existe, no un dato perdido.
 *
 * FECHA DE NACIMIENTO, NO EDAD. La carta y la cita consular usan la del
 * pasaporte; una edad guardada caduca sola en unos meses. La edad se calcula y
 * se enseña aquí mismo para que el padre confirme de un vistazo que no se
 * equivocó de año.
 */
export function FormularioReserva() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nacimiento, setNacimiento] = useState("");

  const edad = calcularEdad(nacimiento);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const datos = Object.fromEntries(f.entries());

    try {
      // 1 · Se guarda la reserva. Si esto falla, no se cobra nada.
      const res = await fetch("/api/bootcamp/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const guardada = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !guardada.id) {
        setError(guardada.error ?? "No se pudo guardar la reserva.");
        setEnviando(false);
        return;
      }

      // 2 · Y sólo entonces, el pago.
      const pago = await fetch("/api/bootcamp/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: guardada.id }),
      });
      const sesion = (await pago.json()) as { url?: string; error?: string };
      if (!pago.ok || !sesion.url) {
        setError(
          sesion.error ??
            "Guardamos tus datos, pero no pudimos abrir el pago. Escríbenos y lo resolvemos.",
        );
        setEnviando(false);
        return;
      }
      window.location.href = sesion.url;
    } catch {
      setError("No se pudo conectar. Revisa tu conexión e inténtalo otra vez.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="rounded-2xl border border-surface-line bg-paper p-5 sm:p-7">
      {/* ── EL PARTICIPANTE ── */}
      <Bloque
        n={1}
        titulo="Quién viaja"
        nota="Tal como aparece en su pasaporte o documento. El consulado rechaza una carta cuyo nombre no coincida."
      >
        <div className="sm:col-span-2">
          <Label htmlFor="participantName">Nombre completo del participante</Label>
          <Input id="participantName" name="participantName" required minLength={3} autoComplete="off" />
        </div>

        <div>
          <Label htmlFor="participantBirthdate">Fecha de nacimiento</Label>
          <Input
            id="participantBirthdate"
            name="participantBirthdate"
            type="date"
            required
            value={nacimiento}
            onChange={(e) => setNacimiento(e.target.value)}
          />
          {/* La edad se enseña calculada, no se pide: así el padre confirma de
              un vistazo que no se equivocó de año al teclear. */}
          {edad !== null && (
            <p
              className={cn(
                "mt-1 text-xs font-semibold",
                edad >= 10 && edad <= 19 ? "text-cyan-700" : "text-rose-600",
              )}
            >
              {edad >= 10 && edad <= 19
                ? `Tendría ${edad} años`
                : `Según esa fecha tendría ${edad} años — revísala`}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="documentId">Pasaporte o DNI</Label>
          <Input id="documentId" name="documentId" required minLength={4} />
          <p className="mt-1 text-xs text-muted">Del participante. Va impreso en la carta.</p>
        </div>

        <div>
          <Label htmlFor="nationality">Nacionalidad</Label>
          <Input id="nationality" name="nationality" required minLength={2} placeholder="Peruana" />
        </div>

        <div>
          <Label htmlFor="academicLevel">Nivel académico</Label>
          <select
            id="academicLevel"
            name="academicLevel"
            required
            defaultValue=""
            className="w-full rounded-xl border border-surface-line bg-paper px-3.5 py-2.5 text-sm text-navy focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
          >
            <option value="" disabled>
              Elige uno
            </option>
            <option value="PRIMARIA">Primaria</option>
            <option value="SECUNDARIA">Secundaria</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="address">Dirección actual</Label>
          <Input id="address" name="address" required minLength={5} placeholder="Calle, número, distrito" />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="residence">Ciudad y país de residencia</Label>
          <Input id="residence" name="residence" required minLength={2} placeholder="Lima, Perú" />
          <p className="mt-1 text-xs text-muted">Determina en qué consulado se pide la cita.</p>
        </div>
      </Bloque>

      {/* ── EL ADULTO ── */}
      <Bloque
        n={2}
        titulo="Tus datos"
        nota="Aquí te enviamos las cartas de invitación y el recibo."
      >
        <div>
          <Label htmlFor="payerName">Tu nombre completo</Label>
          <Input id="payerName" name="payerName" required minLength={3} autoComplete="name" />
        </div>

        <div>
          <Label htmlFor="email">Tu correo electrónico</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>

        <div>
          <Label htmlFor="phone">Teléfono con WhatsApp</Label>
          <Input id="phone" name="phone" placeholder="+51 999 999 999" autoComplete="tel" />
        </div>

        <div>
          <Label htmlFor="companionName">Nombre del acompañante</Label>
          <Input id="companionName" name="companionName" placeholder="Opcional, se puede añadir después" />
          <p className="mt-1 text-xs text-muted">
            El adulto que viaja. Su carta está incluida en el precio.
          </p>
        </div>
      </Bloque>

      {error && (
        <p className="mt-6 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
          <Icon name="clock" size={14} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 font-semibold text-navy shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-300 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {enviando ? <Spinner className="text-navy" /> : <Icon name="lock" size={15} />}
        {enviando ? "Abriendo el pago…" : `Continuar al pago · $${BOOTCAMP.priceUSD}`}
      </button>

      <p className="mt-3 text-xs text-muted">
        Te llevamos a Stripe. Los datos de tu tarjeta nunca pasan por nuestros servidores.
      </p>
    </form>
  );
}

/** Los campos van en dos bloques numerados: quién viaja y quién paga. Doce
    campos seguidos sin agrupar se leen como un trámite; en dos tandas, no. */
function Bloque({
  n,
  titulo,
  nota,
  children,
}: {
  n: number;
  titulo: string;
  nota: string;
  children: React.ReactNode;
}) {
  return (
    <section className={n > 1 ? "mt-8 border-t border-surface-line pt-7" : ""}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy font-display text-xs font-bold text-white">
          {n}
        </span>
        <h2 className="font-display text-lg font-bold text-navy">{titulo}</h2>
      </div>
      <p className="ml-9 mt-1 max-w-[52ch] text-sm text-muted">{nota}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function calcularEdad(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const f = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(f.getTime())) return null;
  const hoy = new Date();
  let a = hoy.getUTCFullYear() - f.getUTCFullYear();
  const m = hoy.getUTCMonth() - f.getUTCMonth();
  if (m < 0 || (m === 0 && hoy.getUTCDate() < f.getUTCDate())) a--;
  return a;
}
