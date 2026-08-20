"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/icons";
import { Spinner, cn } from "@/components/ui";
import { BOOTCAMP } from "@/lib/bootcamp";
import { paisPorGentilicio, type Pais } from "@/lib/paises";
import { SelectorPais, EstrellaMarca } from "./SelectorPais";

/**
 * La reserva, en tres bloques y un repaso.
 *
 * POR QUÉ ACORDEÓN Y NO UNA LISTA LARGA. Son once campos. Vistos de golpe en la
 * pantalla de un teléfono parecen un trámite, y un trámite se deja para luego.
 * Repartidos 4 / 3 / 4, ninguna pantalla pide más de cuatro cosas, y cada
 * bloque terminado se pliega a una línea CON SUS DATOS a la vista — el resumen
 * no es adorno: es lo que evita tener que reabrir para comprobar.
 *
 * EL REPASO NO ES OPCIONAL. Plegar esconde, así que antes de pagar todo vuelve
 * a verse junto. Ahí van marcados los cuatro datos que el consulado coteja.
 *
 * SE GUARDA ANTES DE PAGAR. La reserva nace en PENDING y sólo entonces se abre
 * Stripe: quien abandona en la pasarela sigue siendo un contacto con nombre,
 * correo y país, no un dato perdido.
 *
 * Y SE GUARDA UN BORRADOR EN EL PROPIO DISPOSITIVO mientras se rellena. No es
 * lo mismo que la reserva: es el seguro contra cerrar la pestaña sin querer a
 * mitad del formulario. No puede vivir en el servidor porque el correo —único
 * dato obligatorio para crear la fila— se pide en el último bloque.
 */

type Datos = {
  participantName: string;
  participantBirthdate: string;
  documentId: string;
  academicLevel: "" | "PRIMARIA" | "SECUNDARIA";
  nationality: string;
  residence: string;
  address: string;
  payerName: string;
  email: string;
  phone: string;
  companionName: string;
  sinAcompanante: boolean;
};

const VACIO: Datos = {
  participantName: "",
  participantBirthdate: "",
  documentId: "",
  academicLevel: "",
  nationality: "",
  residence: "",
  address: "",
  payerName: "",
  email: "",
  phone: "",
  companionName: "",
  sinAcompanante: false,
};

const BLOQUES = [
  { n: 1, titulo: "Quién viaja", nota: "Tal como aparece en su pasaporte", pendiente: "Nombre, documento y nivel" },
  { n: 2, titulo: "De dónde viene", nota: "Decide en qué consulado se pide la cita", pendiente: "Nacionalidad, residencia y dirección" },
  { n: 3, titulo: "Tus datos", nota: "Aquí te llegan las cartas y el recibo", pendiente: "Correo, teléfono y acompañante" },
] as const;

/* ── Borrador en el dispositivo ──────────────────────────────────────────── */

const CLAVE = "starbiz:borrador-bootcamp";
let oyentes: Array<() => void> = [];

function suscribir(f: () => void) {
  oyentes.push(f);
  return () => {
    oyentes = oyentes.filter((x) => x !== f);
  };
}
function leerBorrador(): string | null {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}
/** No avisa a los oyentes a propósito: se llama en cada pulsación y provocaría
    un renderizado por tecla. Lo único que necesita refrescarse es la
    desaparición del aviso, y eso sí notifica. */
function guardarBorrador(d: Datos) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(d));
  } catch {
    /* modo privado o almacenamiento lleno: el formulario sigue funcionando */
  }
}
function borrarBorrador() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* nada que hacer */
  }
  oyentes.forEach((f) => f());
}

/* ── Validación ──────────────────────────────────────────────────────────── */

type Errores = Partial<Record<keyof Datos, string>>;

export function calcularEdad(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const f = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(f.getTime())) return null;
  const hoy = new Date();
  let a = hoy.getUTCFullYear() - f.getUTCFullYear();
  const m = hoy.getUTCMonth() - f.getUTCMonth();
  if (m < 0 || (m === 0 && hoy.getUTCDate() < f.getUTCDate())) a--;
  return a;
}

/** Las mismas reglas que aplica el servidor. Duplicarlas aquí no es
    redundancia: sin esto los errores aparecen al final, después de rellenarlo
    todo, que es el peor momento posible para descubrirlos. */
function validar(paso: number, d: Datos): Errores {
  const e: Errores = {};
  if (paso === 1) {
    if (d.participantName.trim().length < 3) e.participantName = "Escribe el nombre completo.";
    const edad = calcularEdad(d.participantBirthdate);
    if (edad === null) e.participantBirthdate = "Indica la fecha de nacimiento.";
    else if (edad < 10 || edad > 19)
      e.participantBirthdate = `Según esa fecha tendría ${edad} años. El bootcamp es para adolescentes de 10 a 19.`;
    if (d.documentId.trim().length < 4) e.documentId = "Indica el pasaporte o DNI.";
    if (!d.academicLevel) e.academicLevel = "Elige un nivel.";
  }
  if (paso === 2) {
    if (!d.nationality) e.nationality = "Elige la nacionalidad.";
    if (d.residence.trim().length < 2) e.residence = "Indica ciudad y país.";
    if (d.address.trim().length < 5) e.address = "Indica la dirección actual.";
  }
  if (paso === 3) {
    if (d.payerName.trim().length < 3) e.payerName = "Escribe tu nombre completo.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) e.email = "Revisa el correo.";
    if (d.phone.trim() && d.phone.replace(/\D/g, "").length < 6)
      e.phone = "El número parece incompleto.";
    if (!d.sinAcompanante && d.companionName.trim() && d.companionName.trim().length < 3)
      e.companionName = "Escribe el nombre completo del acompañante.";
  }
  return e;
}

/* ── Componente ──────────────────────────────────────────────────────────── */

export function FormularioReserva() {
  const [datos, setDatos] = useState<Datos>(VACIO);
  const [paso, setPaso] = useState(1);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState<{ texto: string; guardada: boolean } | null>(null);

  const borrador = useSyncExternalStore(suscribir, leerBorrador, () => null);
  const [borradorResuelto, setBorradorResuelto] = useState(false);
  const hayBorrador = Boolean(borrador) && !borradorResuelto;

  const pais = paisPorGentilicio(datos.nationality);

  function set<K extends keyof Datos>(campo: K, valor: Datos[K]) {
    const siguiente = { ...datos, [campo]: valor };
    setDatos(siguiente);
    guardarBorrador(siguiente);
    // El error de un campo desaparece en cuanto se toca. Dejarlo hasta el
    // próximo envío hace sentir que la corrección no sirvió de nada.
    if (errores[campo]) {
      const resto = { ...errores };
      delete resto[campo];
      setErrores(resto);
    }
  }

  function retomar() {
    try {
      setDatos({ ...VACIO, ...(JSON.parse(borrador ?? "{}") as Partial<Datos>) });
    } catch {
      /* borrador ilegible: se sigue con el formulario vacío */
    }
    setBorradorResuelto(true);
  }

  function avanzar() {
    const e = validar(paso, datos);
    setErrores(e);
    if (Object.keys(e).length > 0) return;
    setPaso(paso + 1);
  }

  /** Un bloque sólo se pliega si está completo; nunca se esconde un error. */
  const completo = (n: number) => Object.keys(validar(n, datos)).length === 0;

  async function pagar() {
    // Se revalidan los tres, no sólo el último: se puede llegar al repaso y
    // volver atrás a romper algo.
    const e = { ...validar(1, datos), ...validar(2, datos), ...validar(3, datos) };
    if (Object.keys(e).length > 0) {
      setErrores(e);
      setPaso(Object.keys(validar(1, datos)).length ? 1 : Object.keys(validar(2, datos)).length ? 2 : 3);
      return;
    }

    setEnviando(true);
    setFallo(null);

    const cuerpo = {
      participantName: datos.participantName.trim(),
      participantBirthdate: datos.participantBirthdate,
      documentId: datos.documentId.trim(),
      nationality: datos.nationality,
      address: datos.address.trim(),
      residence: datos.residence.trim(),
      academicLevel: datos.academicLevel,
      email: datos.email.trim(),
      payerName: datos.payerName.trim(),
      phone: datos.phone.trim() ? `${pais?.prefijo ?? ""} ${datos.phone.trim()}`.trim() : "",
      companionName: datos.sinAcompanante ? "" : datos.companionName.trim(),
    };

    try {
      const res = await fetch("/api/bootcamp/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const guardada = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !guardada.id) {
        setFallo({ texto: guardada.error ?? "No se pudo guardar la reserva.", guardada: false });
        setEnviando(false);
        return;
      }

      // A partir de aquí la reserva ya existe en el panel. El borrador local
      // deja de tener sentido y se retira.
      borrarBorrador();

      const pago = await fetch("/api/bootcamp/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: guardada.id }),
      });
      const sesion = (await pago.json()) as { url?: string; error?: string };
      if (!pago.ok || !sesion.url) {
        setFallo({
          texto: `Guardamos tu reserva, pero no pudimos abrir el pago. Tu cupo queda apartado — te escribimos a ${cuerpo.email}.`,
          guardada: true,
        });
        setEnviando(false);
        return;
      }
      window.location.href = sesion.url;
    } catch {
      setFallo({ texto: "No se pudo conectar. Tus datos siguen aquí — inténtalo otra vez.", guardada: false });
      setEnviando(false);
    }
  }

  return (
    <div>
      <Progreso paso={paso} completo={completo} />

      {hayBorrador && paso === 1 && (
        <div className="mt-5 rounded-2xl border border-cyan-bright/30 bg-cyan-bright/[0.07] p-4">
          <p className="flex items-start gap-2.5 text-sm leading-snug text-white">
            <EstrellaMarca className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
            Tenías una reserva a medias en este dispositivo.
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={retomar}
              className="min-h-[44px] rounded-full bg-cyan-bright/20 px-4 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-bright/30"
            >
              Retomarla
            </button>
            <button
              type="button"
              onClick={() => {
                borrarBorrador();
                setBorradorResuelto(true);
              }}
              className="min-h-[44px] px-3 text-sm text-white/50 transition-colors hover:text-white/80"
            >
              Empezar de cero
            </button>
          </div>
        </div>
      )}

      {paso <= 3 ? (
        <>
          <div className="mt-5 space-y-3">
            {BLOQUES.map((b) => {
              if (b.n === paso) {
                return (
                  <Abierto key={b.n} n={b.n} titulo={b.titulo} nota={b.nota}>
                    {b.n === 1 && <Bloque1 datos={datos} errores={errores} set={set} />}
                    {b.n === 2 && <Bloque2 datos={datos} errores={errores} set={set} />}
                    {b.n === 3 && (
                      <Bloque3 datos={datos} errores={errores} set={set} prefijo={pais?.prefijo} />
                    )}
                  </Abierto>
                );
              }
              if (b.n < paso && completo(b.n)) {
                return (
                  <Plegado
                    key={b.n}
                    titulo={b.titulo}
                    resumen={resumenDe(b.n, datos)}
                    fichas={b.n === 1 ? fichasDe(datos) : undefined}
                    aviso={
                      b.n === 3 && !datos.companionName.trim()
                        ? "Falta el acompañante. Puedes pagar igual, pero la segunda carta no sale hasta que llegue ese nombre."
                        : undefined
                    }
                    onEditar={() => setPaso(b.n)}
                  />
                );
              }
              return <Pendiente key={b.n} n={b.n} titulo={b.titulo} nota={b.pendiente} />;
            })}
          </div>

          <button
            type="button"
            onClick={avanzar}
            className={cn(
              "mt-6 flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-full font-display text-[0.95rem] font-bold transition-all duration-200",
              paso === 3
                ? "bg-gold text-navy shadow-[0_12px_32px_-8px_rgba(251,191,36,0.65)] hover:bg-gold-300"
                : "border border-white/15 bg-white/[0.09] text-white hover:bg-white/[0.14]",
            )}
          >
            {paso === 3 ? `Repasar y pagar · $${BOOTCAMP.priceUSD}` : `Siguiente · ${BLOQUES[paso].titulo}`}
            <Icon name="arrowRight" size={15} />
          </button>

          <p className="mt-3.5 text-center text-xs leading-relaxed text-white/40">
            {paso === 3
              ? "Todavía no se cobra nada. Verás todo junto antes de pagar."
              : `Al terminar los tres pasos: $${BOOTCAMP.priceUSD} con Stripe.`}
          </p>
        </>
      ) : (
        <Repaso
          datos={datos}
          pais={pais}
          enviando={enviando}
          fallo={fallo}
          onEditar={(n) => setPaso(n)}
          onPagar={pagar}
        />
      )}
    </div>
  );
}

/* ── Progreso ────────────────────────────────────────────────────────────── */

function Progreso({ paso, completo }: { paso: number; completo: (n: number) => boolean }) {
  return (
    <div className="relative flex items-start">
      <span className="absolute left-[16%] right-[16%] top-1.5 h-px bg-white/12" aria-hidden />
      {BLOQUES.map((b) => {
        const hecho = b.n < paso && completo(b.n);
        const activo = b.n === paso;
        return (
          <span key={b.n} className="relative flex flex-1 flex-col items-center gap-2">
            <span
              className={cn(
                "rounded-full",
                hecho
                  ? "h-3 w-3 bg-gold shadow-[0_0_12px_3px_rgba(251,191,36,0.5)]"
                  : activo
                    ? "h-3.5 w-3.5 bg-cyan-bright shadow-[0_0_0_4px_rgba(34,211,238,0.16),0_0_16px_3px_rgba(34,211,238,0.55)]"
                    : "mt-1 h-2 w-2 bg-white/22",
              )}
            />
            <span
              className={cn(
                "text-center text-[0.66rem] font-semibold",
                hecho ? "text-gold-300" : activo ? "text-cyan-50" : "text-white/38",
              )}
            >
              {b.titulo}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/* ── Bloques ─────────────────────────────────────────────────────────────── */

function Abierto({
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
    <section className="rounded-2xl border border-cyan-bright/30 bg-gradient-to-b from-white/[0.075] to-white/[0.026] p-4 shadow-[0_22px_54px_-26px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.11)] sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-bright/55 bg-cyan-bright/[0.18] font-display text-xs font-bold text-cyan-50">
          {n}
        </span>
        <span className="flex-1">
          <h2 className="font-display text-[1.05rem] font-bold leading-tight text-white">{titulo}</h2>
          <p className="mt-0.5 text-xs text-white/45">{nota}</p>
        </span>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Plegado({
  titulo,
  resumen,
  fichas,
  aviso,
  onEditar,
}: {
  titulo: string;
  resumen: string;
  fichas?: string[];
  aviso?: string;
  onEditar: () => void;
}) {
  return (
    <section className="rounded-2xl border border-gold/30 bg-gold/[0.055] p-4">
      <div className="flex items-center gap-3">
        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
          <span
            className="absolute -inset-1 rounded-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.4),transparent_72%)]"
            aria-hidden
          />
          <EstrellaMarca className="relative h-[18px] w-[18px] text-gold" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[0.92rem] font-bold text-white">{titulo}</span>
          <span className="mt-0.5 block truncate text-xs text-white/55">{resumen}</span>
        </span>
        <button
          type="button"
          onClick={onEditar}
          className="-mr-1.5 min-h-[44px] shrink-0 px-2.5 text-[0.82rem] font-semibold text-gold-300 transition-colors hover:text-gold"
        >
          Editar
        </button>
      </div>

      {fichas && fichas.length > 0 && (
        <div className="ml-9 mt-2.5 flex flex-wrap gap-1.5">
          {fichas.map((f) => (
            <span
              key={f}
              className="rounded-full border border-white/11 bg-white/[0.07] px-2.5 py-1 text-[0.7rem] text-white/72"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {aviso && (
        <p className="mt-3 rounded-xl border border-gold/22 bg-gold/10 px-3 py-2.5 text-xs leading-snug text-gold-300">
          {aviso}
        </p>
      )}
    </section>
  );
}

function Pendiente({ n, titulo, nota }: { n: number; titulo: string; nota: string }) {
  return (
    <section className="rounded-2xl border border-dashed border-white/14 p-4 opacity-60">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-display text-[0.72rem] font-bold text-white/45">
          {n}
        </span>
        <span className="flex-1">
          <span className="block font-display text-[0.92rem] font-bold text-white/72">{titulo}</span>
          <span className="mt-0.5 block text-xs text-white/38">{nota}</span>
        </span>
        <Icon name="arrowRight" size={14} className="shrink-0 rotate-90 text-white/35" />
      </div>
    </section>
  );
}

/* ── Campos ──────────────────────────────────────────────────────────────── */

function Campo({
  etiqueta,
  error,
  ayuda,
  children,
  id,
}: {
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.78rem] font-medium text-white/75">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-xs leading-snug text-rose-400">
          <Icon name="clock" size={12} className="mt-px shrink-0" />
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className="mt-1.5 text-xs leading-snug text-white/40">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

/** 16px de tipo: por debajo de eso iOS hace zoom solo al enfocar y descoloca
    la pantalla entera. */
const CAMPO =
  "min-h-[50px] w-full rounded-xl border bg-navy/40 px-3.5 py-3 text-base text-white placeholder:text-white/26 focus:outline-none";

function Entrada({
  id,
  error,
  ...props
}: React.ComponentProps<"input"> & { error?: string }) {
  return (
    <input
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(
        CAMPO,
        error
          ? "border-rose-400/60 bg-rose-500/10"
          : "border-white/15 focus:border-cyan-bright/75 focus:ring-[3px] focus:ring-cyan-bright/15",
      )}
      {...props}
    />
  );
}

type SetFn = <K extends keyof Datos>(c: K, v: Datos[K]) => void;

function Bloque1({ datos, errores, set }: { datos: Datos; errores: Errores; set: SetFn }) {
  const edad = calcularEdad(datos.participantBirthdate);
  return (
    <>
      <Campo
        id="participantName"
        etiqueta="Nombre completo del participante"
        error={errores.participantName}
        ayuda="El consulado rechaza una carta cuyo nombre no coincida con el pasaporte."
      >
        <Entrada
          id="participantName"
          error={errores.participantName}
          value={datos.participantName}
          onChange={(e) => set("participantName", e.target.value)}
          autoComplete="off"
        />
      </Campo>

      <Campo
        id="participantBirthdate"
        etiqueta="Fecha de nacimiento"
        error={errores.participantBirthdate}
      >
        <Entrada
          id="participantBirthdate"
          type="date"
          error={errores.participantBirthdate}
          value={datos.participantBirthdate}
          onChange={(e) => set("participantBirthdate", e.target.value)}
        />
        {/* La edad se enseña calculada, no se pide: así se confirma de un
            vistazo que no se erró el año al teclear. */}
        {!errores.participantBirthdate && edad !== null && edad >= 10 && edad <= 19 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-cyan-bright">
            <EstrellaMarca className="h-2.5 w-2.5" />
            Tendría {edad} años
          </p>
        )}
      </Campo>

      <Campo id="documentId" etiqueta="Pasaporte o DNI" error={errores.documentId} ayuda="Del participante. Va impreso en la carta.">
        <Entrada
          id="documentId"
          error={errores.documentId}
          value={datos.documentId}
          onChange={(e) => set("documentId", e.target.value)}
        />
      </Campo>

      <div>
        <span className="mb-2 block text-[0.78rem] font-medium text-white/75">Nivel académico</span>
        <div className="flex gap-2.5">
          {(["PRIMARIA", "SECUNDARIA"] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => set("academicLevel", n)}
              aria-pressed={datos.academicLevel === n}
              className={cn(
                "flex min-h-[48px] flex-1 items-center justify-center rounded-xl border text-[0.9rem] transition-colors",
                datos.academicLevel === n
                  ? "border-cyan-bright/65 bg-cyan-bright/[0.13] font-semibold text-cyan-50"
                  : "border-white/14 bg-navy/40 text-white/70 hover:border-white/25",
              )}
            >
              {n === "PRIMARIA" ? "Primaria" : "Secundaria"}
            </button>
          ))}
        </div>
        {errores.academicLevel && (
          <p className="mt-2 text-xs text-rose-400">{errores.academicLevel}</p>
        )}
      </div>
    </>
  );
}

function Bloque2({ datos, errores, set }: { datos: Datos; errores: Errores; set: SetFn }) {
  return (
    <>
      <div>
        <span className="mb-1.5 block text-[0.78rem] font-medium text-white/75">Nacionalidad</span>
        <SelectorPais
          value={datos.nationality || null}
          onChange={(p: Pais) => set("nationality", p.gentilicio)}
          error={Boolean(errores.nationality)}
        />
        {errores.nationality && <p className="mt-2 text-xs text-rose-400">{errores.nationality}</p>}
      </div>

      <Campo
        id="residence"
        etiqueta="Ciudad y país de residencia"
        error={errores.residence}
        ayuda="Determina en qué consulado se pide la cita."
      >
        <Entrada
          id="residence"
          error={errores.residence}
          placeholder="Lima, Perú"
          value={datos.residence}
          onChange={(e) => set("residence", e.target.value)}
        />
      </Campo>

      <Campo id="address" etiqueta="Dirección actual" error={errores.address}>
        <Entrada
          id="address"
          error={errores.address}
          placeholder="Calle, número, distrito"
          value={datos.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </Campo>
    </>
  );
}

function Bloque3({
  datos,
  errores,
  set,
  prefijo,
}: {
  datos: Datos;
  errores: Errores;
  set: SetFn;
  prefijo?: string;
}) {
  return (
    <>
      <Campo id="payerName" etiqueta="Tu nombre completo" error={errores.payerName}>
        <Entrada
          id="payerName"
          error={errores.payerName}
          placeholder="Madre, padre o tutor"
          autoComplete="name"
          value={datos.payerName}
          onChange={(e) => set("payerName", e.target.value)}
        />
      </Campo>

      <Campo
        id="email"
        etiqueta="Tu correo electrónico"
        error={errores.email}
        ayuda="Revísalo bien: las dos cartas de invitación salen a esta dirección."
      >
        <Entrada
          id="email"
          type="email"
          error={errores.email}
          placeholder="tucorreo@ejemplo.com"
          autoComplete="email"
          value={datos.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </Campo>

      <Campo
        id="phone"
        etiqueta="Teléfono con WhatsApp"
        error={errores.phone}
        ayuda={prefijo ? "El prefijo viene de la nacionalidad que elegiste." : undefined}
      >
        <div className="flex gap-2.5">
          {/* El prefijo sale del país del paso 2: un dato menos que teclear. */}
          {prefijo && (
            <span className="flex min-h-[50px] shrink-0 items-center rounded-xl border border-white/15 bg-navy/40 px-3.5 text-base text-white/85">
              {prefijo}
            </span>
          )}
          <Entrada
            id="phone"
            type="tel"
            error={errores.phone}
            placeholder="999 999 999"
            autoComplete="tel"
            value={datos.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
      </Campo>

      {/* EL ACOMPAÑANTE. Hoy este campo llega vacío una y otra vez y bloquea la
          segunda carta, porque se presentaba como un campo suelto y opcional
          sin decir qué se pierde al dejarlo. */}
      <div className="rounded-2xl border border-gold/28 bg-gold/[0.05] p-4">
        <div className="flex items-start gap-2.5">
          <EstrellaMarca className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <span>
            <span className="block font-display text-[0.9rem] font-bold text-white">
              Tu carta también está incluida
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-white/62">
              Un adulto viaja con el participante y recibe su propia carta de invitación. Sin coste
              extra.
            </span>
          </span>
        </div>

        {!datos.sinAcompanante && (
          <div className="mt-3.5">
            <label htmlFor="companionName" className="mb-1.5 block text-[0.78rem] font-medium text-white/75">
              Nombre del acompañante, como en su pasaporte
            </label>
            <Entrada
              id="companionName"
              error={errores.companionName}
              placeholder="Nombre y apellidos"
              value={datos.companionName}
              onChange={(e) => set("companionName", e.target.value)}
            />
            {errores.companionName && (
              <p className="mt-2 text-xs text-rose-400">{errores.companionName}</p>
            )}
          </div>
        )}

        {/* Sin esta salida el campo se rellena a lo loco o se abandona el paso. */}
        <button
          type="button"
          onClick={() => {
            set("sinAcompanante", !datos.sinAcompanante);
            if (!datos.sinAcompanante) set("companionName", "");
          }}
          aria-pressed={datos.sinAcompanante}
          className="mt-2.5 flex min-h-[44px] w-full items-center gap-2.5 text-left text-[0.82rem] text-white/68 transition-colors hover:text-white"
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors",
              datos.sinAcompanante ? "border-gold bg-gold text-navy" : "border-white/28",
            )}
          >
            {datos.sinAcompanante && <Icon name="check" size={11} />}
          </span>
          Aún no lo sé — lo añado después
        </button>
      </div>
    </>
  );
}

/* ── Resúmenes ───────────────────────────────────────────────────────────── */

function resumenDe(n: number, d: Datos): string {
  if (n === 1) return d.participantName;
  if (n === 2) return [d.nationality, d.residence].filter(Boolean).join(" · ");
  return [d.payerName, d.email].filter(Boolean).join(" · ");
}

function fichasDe(d: Datos): string[] {
  const edad = calcularEdad(d.participantBirthdate);
  return [
    edad !== null ? `${edad} años` : "",
    d.documentId,
    d.academicLevel === "PRIMARIA" ? "Primaria" : d.academicLevel === "SECUNDARIA" ? "Secundaria" : "",
  ].filter(Boolean);
}

/* ── Repaso ──────────────────────────────────────────────────────────────── */

function Repaso({
  datos,
  pais,
  enviando,
  fallo,
  onEditar,
  onPagar,
}: {
  datos: Datos;
  pais: Pais | null;
  enviando: boolean;
  fallo: { texto: string; guardada: boolean } | null;
  onEditar: (n: number) => void;
  onPagar: () => void;
}) {
  const edad = calcularEdad(datos.participantBirthdate);
  const tel = datos.phone.trim() ? `${pais?.prefijo ?? ""} ${datos.phone.trim()}`.trim() : "—";

  // "En la carta" sólo en los cuatro datos que el consulado coteja. Marcarlo
  // todo sería no marcar nada.
  type Fila = { k: string; v: string; sello?: boolean; flojo?: boolean };
  const grupos: Array<{ n: number; titulo: string; filas: Fila[] }> = [
    {
      n: 1,
      titulo: "Quién viaja",
      filas: [
        { k: "Nombre", v: datos.participantName, sello: true },
        { k: "Nacimiento", v: `${datos.participantBirthdate}${edad !== null ? ` · ${edad} años` : ""}` },
        { k: "Documento", v: datos.documentId, sello: true },
        { k: "Nivel", v: datos.academicLevel === "PRIMARIA" ? "Primaria" : "Secundaria" },
      ],
    },
    {
      n: 2,
      titulo: "De dónde viene",
      filas: [
        { k: "Nacionalidad", v: datos.nationality, sello: true },
        { k: "Residencia", v: datos.residence },
        { k: "Dirección", v: datos.address },
      ],
    },
    {
      n: 3,
      titulo: "Tus datos",
      filas: [
        { k: "Responsable", v: datos.payerName },
        // El correo NO lleva sello: no se imprime en la carta, es a donde se
        // envía. Marcarlo sería mentir sobre lo que revisa el consulado.
        { k: "Correo", v: datos.email },
        { k: "Teléfono", v: tel },
        {
          k: "Acompañante",
          v: datos.companionName.trim() || "Lo añadirás después",
          sello: true,
          flojo: !datos.companionName.trim(),
        },
      ],
    },
  ];

  return (
    <div className="mt-5">
      <h2 className="font-display text-[1.4rem] font-extrabold leading-tight tracking-tight text-white sm:text-2xl">
        Repasa antes de pagar
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        Esto es exactamente lo que irá impreso en las dos cartas. Un nombre que no coincida con el
        pasaporte hace que el consulado la rechace.
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/14 bg-gradient-to-b from-white/[0.075] to-white/[0.026] shadow-[0_22px_54px_-26px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.11)]">
        {grupos.map((g, i) => (
          <div key={g.n} className={i > 0 ? "border-t border-white/9" : undefined}>
            <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3.5">
              <span className="flex items-center gap-2.5">
                <EstrellaMarca className="h-3.5 w-3.5 text-gold" />
                <span className="font-display text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-white/55">
                  {g.titulo}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onEditar(g.n)}
                className="-mr-1.5 min-h-[44px] px-2 text-[0.82rem] font-semibold text-gold-300 transition-colors hover:text-gold"
              >
                Editar
              </button>
            </div>
            <dl className="px-4 pb-3.5">
              {g.filas.map((f, j) => (
                <div
                  key={f.k}
                  className={cn(
                    "flex items-baseline gap-3 py-1.5",
                    j < g.filas.length - 1 && "border-b border-white/7",
                  )}
                >
                  <dt className="w-[86px] shrink-0 text-xs text-white/42">{f.k}</dt>
                  <dd
                    className={cn(
                      "min-w-0 flex-1 break-words text-sm",
                      f.flojo
                        ? "italic text-gold-300"
                        : f.sello
                          ? "font-semibold text-white"
                          : "text-white/80",
                    )}
                  >
                    {f.v || "—"}
                  </dd>
                  {f.sello && (
                    <span className="shrink-0 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-gold/75">
                      en la carta
                    </span>
                  )}
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {/* Qué se lleva por sus $250. Sólo en móvil: en escritorio ya lo enseña
          la columna lateral, y repetirlo allí sería decirlo dos veces en la
          misma pantalla. */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-cyan-bright/22 bg-[rgba(11,20,42,0.75)] lg:hidden">
        <span className="block h-0.5 bg-gradient-to-r from-cyan-bright via-cyan to-gold" aria-hidden />
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/42">
              Qué se emite
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-display text-[1.65rem] font-extrabold tracking-tight text-white">
                ${BOOTCAMP.priceUSD}
              </span>
              <span className="text-xs text-white/45">USD</span>
            </span>
          </div>

          <div className="mt-3.5 space-y-2.5 border-t border-white/9 pt-3.5">
            {[
              "Tu cupo en el Bootcamp Utah 2027",
              `Carta de invitación para ${datos.participantName.split(" ")[0] || "el participante"}`,
              "Carta de invitación para su acompañante",
              "El programa completo de los 4 días y el acompañamiento del equipo",
            ].map((i) => (
              <p key={i} className="flex gap-2.5 text-[0.8rem] leading-snug text-white/82">
                <EstrellaMarca className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                {i}
              </p>
            ))}
          </div>

          {/* Decirlo ahora evita la discusión de después. */}
          <p className="mt-3.5 border-t border-white/9 pt-3 text-xs leading-relaxed text-white/42">
            No incluye vuelos, hospedaje, comidas, transporte local ni tasas consulares.
          </p>
        </div>
      </div>

      {fallo && (
        <p
          className={cn(
            "mt-4 flex items-start gap-2.5 rounded-2xl border p-3.5 text-sm leading-relaxed",
            fallo.guardada
              ? "border-gold/24 bg-gold/[0.09] text-gold-300"
              : "border-rose-400/28 bg-rose-500/[0.09] text-rose-400",
          )}
        >
          <Icon name={fallo.guardada ? "clock" : "close"} size={14} className="mt-0.5 shrink-0" />
          {fallo.texto}
        </p>
      )}

      <button
        type="button"
        onClick={onPagar}
        disabled={enviando}
        className="mt-5 flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-full bg-gold font-display text-base font-bold text-navy shadow-[0_14px_38px_-8px_rgba(251,191,36,0.7)] transition-all duration-200 hover:bg-gold-300 disabled:cursor-wait disabled:opacity-70"
      >
        {enviando ? <Spinner className="text-navy" /> : <Icon name="lock" size={15} />}
        {enviando ? "Guardando y abriendo Stripe…" : `Pagar $${BOOTCAMP.priceUSD} y reservar`}
      </button>

      <p className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-xs text-white/40">
        <Icon name="lock" size={11} />
        Te llevamos a Stripe · tu tarjeta nunca pasa por nuestros servidores
      </p>
    </div>
  );
}
