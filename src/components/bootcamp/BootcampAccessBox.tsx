"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { Icon } from "@/components/icons";

/**
 * Cuadro de acceso al bootcamp, embebido DENTRO de la publicación del equipo.
 *
 * Antes esto era una tarjeta suelta encima del feed. Vive mejor aquí: dentro
 * del post hereda la prueba social que una tarjeta flotante no tiene —autor
 * con cara, fecha, reacciones y, sobre todo, la conversación de los comentarios
 * (la pregunta de un padre sobre el consulado y su respuesta)—. Un anuncio con
 * una conversación real alrededor convierte más que un banner.
 *
 * A cambio pierde visibilidad, y por eso el post va FIJADO al principio.
 *
 * Se mantiene la contención de la versión anterior: superficie clara, un único
 * acento —el filo dorado del canto— y tres piezas de información. Ni una más.
 */
export function BootcampAccessBox() {
  const { dict } = useI18n();
  const B = dict.bootcamp;

  return (
    <Link
      href="/bootcamp"
      className="group relative mt-4 flex items-center gap-4 overflow-hidden rounded-2xl border border-surface-line bg-surface/70 py-4 pl-5 pr-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:bg-paper hover:shadow-[0_10px_28px_-10px_rgba(251,191,36,0.45)]"
    >
      {/* El único acento: filo dorado en el canto. */}
      <span
        className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-gold-300 via-gold to-gold-700"
        aria-hidden
      />

      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-gold"
        aria-hidden
      >
        <Icon name="star" size={19} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-gold-700">
          {B.feedEyebrow}
        </p>
        <p className="mt-1 font-display text-[0.98rem] font-bold leading-snug text-navy [text-wrap:balance]">
          {B.feedTitle}
        </p>
        <p className="mt-1 text-xs text-muted">
          {B.feedSeats} · {B.feedDeadline}
        </p>
      </div>

      <span className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-cyan-700 transition-transform group-hover:translate-x-0.5 sm:inline-flex">
        {B.feedCta}
        <Icon name="arrowRight" size={15} />
      </span>
      <Icon
        name="arrowRight"
        size={18}
        className="shrink-0 text-cyan-700 transition-transform group-hover:translate-x-0.5 sm:hidden"
      />
    </Link>
  );
}
