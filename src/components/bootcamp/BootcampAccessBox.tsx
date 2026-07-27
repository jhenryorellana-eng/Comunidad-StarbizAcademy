"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { Icon } from "@/components/icons";
import { BOOTCAMP_MEDIA } from "@/lib/bootcamp";

/**
 * Cuadro de acceso al bootcamp, embebido DENTRO de la publicación del equipo.
 *
 * Vive aquí y no como tarjeta suelta encima del feed: dentro del post hereda la
 * prueba social que una tarjeta flotante no tiene —autor con cara, fecha,
 * reacciones y la conversación de los comentarios—. Un anuncio con una
 * conversación real alrededor convierte más que un banner.
 *
 * LA FOTO ES REAL, no la ilustración de marca. Chicos con mochila cruzando el
 * campus nevado con las montañas de Utah detrás: un padre se ve a su hijo
 * dentro de ese grupo. Una montaña ilustrada no consigue eso — es bonita, pero
 * no deja imaginarse a nadie dentro.
 *
 * Y va a lo ANCHO, arriba del todo, con la llamada bien separada más abajo. En
 * la versión anterior la foto iba al lado del botón y el conjunto se leía como
 * un pie de imagen en vez de como una invitación.
 */
export function BootcampAccessBox() {
  const { dict } = useI18n();
  const B = dict.bootcamp;
  const foto = BOOTCAMP_MEDIA.invite;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-surface-line bg-paper">
      {/* ── LA FOTO, a todo lo ancho ── */}
      <Link href="/bootcamp" className="group relative block h-40 w-full overflow-hidden sm:h-52">
        {foto && (
          <Image
            src={foto.src}
            alt={foto.alt}
            fill
            sizes="(max-width: 640px) 100vw, 620px"
            // Sólo `transform`: la capa ya está pintada, así que acercarla no
            // cuesta un repintado.
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
        {/* Velo sólo por abajo: lo justo para que el titular se lea sin apagar
            la nieve ni las montañas, que son medio argumento. */}
        <span
          className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,10,24,0.88)_0%,rgba(6,10,24,0.35)_40%,transparent_72%)]"
          aria-hidden
        />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-navy/80 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-gold backdrop-blur-sm">
          <Icon name="events" size={10} />
          26–31 ENE
        </span>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-gold">
            {B.feedEyebrow}
          </p>
          <p className="mt-1 font-display text-[1.1rem] font-bold leading-snug text-white [text-wrap:balance] sm:text-[1.3rem]">
            {B.feedTitle}
          </p>
        </div>
      </Link>

      {/* ── LA LLAMADA, separada ──
          Franja propia, con su línea de separación y el filo dorado abajo. La
          foto invita; esto es lo que hay que hacer con esa invitación. Pegados,
          el botón se leía como un pie de foto. */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-surface-line bg-surface/60 px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-gold-700">
            <Icon name="star" size={9} />
            {B.feedSeats}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-navy/[0.06] px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-muted">
            <Icon name="clock" size={9} />
            {B.feedDeadline}
          </span>
        </div>

        <Link
          href="/bootcamp"
          className="group/cta inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2 text-[0.85rem] font-semibold text-white shadow-[0_8px_22px_-8px_rgba(26,39,68,0.6)] transition-all duration-300 hover:-translate-y-px hover:bg-gold hover:text-navy hover:shadow-[0_10px_26px_-8px_rgba(251,191,36,0.7)]"
        >
          {B.feedCta}
          <Icon
            name="arrowRight"
            size={14}
            className="transition-transform duration-300 group-hover/cta:translate-x-0.5"
          />
        </Link>

        <span
          className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-gold-300 via-gold to-gold-700"
          aria-hidden
        />
      </div>
    </div>
  );
}
