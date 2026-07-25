"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { Avatar, Badge, Input, cn } from "@/components/ui";
import { Icon } from "@/components/icons";
import { timeAgo } from "@/lib/format";
import { ReportButton } from "./ReportButton";
import { ShareButton } from "./ShareButton";
import { VideoEmbed } from "./VideoEmbed";
import type { FirstSale } from "@/lib/constants";
import { BootcampAccessBox } from "@/components/bootcamp/BootcampAccessBox";

export type CommentDTO = {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string };
};
export type PostDTO = {
  id: string;
  title: string;
  body: string;
  category: string;
  videoUrl: string | null;
  /** Fijado al principio del feed por el equipo. */
  pinned: boolean;
  createdAt: string;
  author: { name: string; role: string; createdAt: string };
  reactionCount: number;
  reactedByMe: boolean;
  comments: CommentDTO[];
};

export function PostFeed({
  posts,
  loggedIn,
  openComments = false,
}: {
  posts: PostDTO[];
  loggedIn: boolean;
  /** true en la página de detalle: los comentarios llegan desplegados. */
  openComments?: boolean;
}) {
  const { dict } = useI18n();
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-line bg-paper p-12 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-cyan">
          <Icon name="posts" size={20} />
        </span>
        <p className="mt-3 text-muted">{dict.community.posts.empty}</p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {posts.map((p, i) => (
        // Entrada escalonada: los posts no aparecen de golpe, se van posando.
        // Sólo los primeros llevan retardo — más allá del pliegue nadie lo ve
        // y encadenar 20 retardos sólo retrasaría el contenido.
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
            delay: Math.min(i, 4) * 0.07,
          }}
        >
          <PostCard post={p} loggedIn={loggedIn} openComments={openComments} />
        </motion.div>
      ))}
    </div>
  );
}

export function parseFirstSale(body: string): FirstSale | null {
  try {
    const j = JSON.parse(body);
    if (j && typeof j.sold === "string" && typeof j.learned === "string") return j;
  } catch {
    // legacy free-text body — render as a normal post
  }
  return null;
}

function PostCard({
  post,
  loggedIn,
  openComments = false,
}: {
  post: PostDTO;
  loggedIn: boolean;
  openComments?: boolean;
}) {
  const { locale, dict } = useI18n();
  const P = dict.community.posts;
  const [reacted, setReacted] = useState(post.reactedByMe);
  const [count, setCount] = useState(post.reactionCount);
  const [comments, setComments] = useState<CommentDTO[]>(post.comments);
  const [showComments, setShowComments] = useState(openComments);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const firstSale = post.category === "FIRST_SALE" ? parseFirstSale(post.body) : null;

  const memberSince = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(post.author.createdAt));

  async function toggleReaction() {
    if (!loggedIn) {
      window.location.href = "/login";
      return;
    }
    // optimistic
    setReacted((r) => !r);
    setCount((c) => c + (reacted ? -1 : 1));
    const res = await fetch(`/api/posts/${post.id}/reactions`, { method: "POST" });
    if (res.ok) {
      const j = await res.json();
      setReacted(j.reacted);
      setCount(j.count);
    }
  }

  async function addComment() {
    if (!loggedIn) {
      window.location.href = "/login";
      return;
    }
    if (!text.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    setBusy(false);
    if (res.ok) {
      const c = (await res.json()) as CommentDTO;
      setComments((prev) => [...prev, c]);
      setText("");
    }
  }

  const catBadge =
    post.category === "VOICE"
      ? locale === "es" ? "Voz" : "Voice"
      : post.category === "ANNOUNCEMENT"
        ? locale === "es" ? "Anuncio" : "Announcement"
        : null;

  return (
    <article
      className={cn(
        "relative rounded-2xl border bg-paper p-6",
        // En escritorio hay cursor: la tarjeta responde a él. Se eleva, el
        // borde se templa y aparece una sombra de color de marca.
        "transition-all duration-300 lg:hover:-translate-y-0.5",
        // "Mi primera venta" se destaca: borde cian + estrella
        post.category === "FIRST_SALE"
          ? "border-cyan/50 shadow-[0_0_28px_rgba(8,145,178,0.12)] lg:hover:border-cyan/80 lg:hover:shadow-[0_16px_38px_-14px_rgba(8,145,178,0.4)]"
          : post.pinned
            ? "border-gold/45 shadow-[0_0_28px_rgba(251,191,36,0.10)] lg:hover:border-gold/70 lg:hover:shadow-[0_16px_38px_-14px_rgba(251,191,36,0.45)]"
            : "border-surface-line lg:hover:border-cyan/30 lg:hover:shadow-[0_16px_38px_-16px_rgba(8,145,178,0.30)]",
      )}
    >
      {post.category === "FIRST_SALE" && (
        <span
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-bright/70 to-transparent"
          aria-hidden
        />
      )}
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-bold leading-snug text-navy">
          {post.category === "FIRST_SALE" && (
            <span className="mr-1.5 inline-flex text-gold-700" aria-hidden>
              <Icon name="star" size={18} className="inline" />
            </span>
          )}
          {post.title}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {post.pinned && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-gold-700"
              title={P.pinned}
            >
              <Icon name="pin" size={10} />
              {P.pinned}
            </span>
          )}
          {post.category === "FIRST_SALE" ? (
            <Badge tone="cyan">{P.firstSaleBadge}</Badge>
          ) : (
            catBadge && <Badge tone="cyan">{catBadge}</Badge>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {/* Anillo de rol: quién habla se ve antes de leer el nombre. */}
        <Avatar
          name={post.author.name}
          size={38}
          className={cn(
            "ring-2 ring-offset-2 ring-offset-paper",
            post.author.role === "ADMIN"
              ? "ring-gold/70"
              : post.author.role === "MENTOR"
                ? "ring-cyan/60"
                : "ring-transparent",
          )}
        />
        <div className="text-sm">
          <p className="font-semibold text-navy">
            {post.author.name}{" "}
            <span className="font-normal text-muted">· {timeAgo(new Date(post.createdAt), locale)}</span>
          </p>
          <p className="text-xs text-muted">
            {dict.community.membersDir.memberSince} {memberSince}
          </p>
        </div>
      </div>

      {firstSale ? (
        <dl className="mt-4 grid gap-3 rounded-xl bg-cyan-50/60 p-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              {P.soldWhat}
            </dt>
            <dd className="mt-0.5 text-sm text-ink/90">{firstSale.sold}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              {P.soldTo}
            </dt>
            <dd className="mt-0.5 text-sm text-ink/90">{firstSale.to}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              {P.soldAmount}
            </dt>
            <dd className="mt-0.5 text-sm font-bold text-navy">{firstSale.amount}</dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              {P.soldLearned}
            </dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-ink/90">
              {firstSale.learned}
            </dd>
          </div>
        </dl>
      ) : (
        // Medida de lectura acotada: a ancho completo daba 104 caracteres por
        // línea y el rango cómodo es 60–75. Pasado ese punto el ojo pierde el
        // renglón al volver a la izquierda y cansa sin que el lector sepa por
        // qué. Medida explícita y no `ch`, porque `ch` mide el ancho del cero
        // —más ancho que la media de la prosa— y se queda corto. En escritorio
        // sube además a 17px: ancho justo y cuerpo mayor es más cómodo que
        // ancho justo a secas.
        <p className="mt-4 max-w-[37rem] whitespace-pre-line text-base leading-relaxed text-ink/90 sm:text-[1.0625rem]">
          {post.body}
        </p>
      )}

      {post.videoUrl && <VideoEmbed videoUrl={post.videoUrl} title={post.title} />}

      {/* El anuncio fijado del bootcamp lleva su cuadro de acceso dentro: el
          CTA hereda así la prueba social del propio post (autor, reacciones y
          la conversación de los comentarios). */}
      {post.pinned && post.category === "BOOTCAMP" && <BootcampAccessBox />}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-surface-line pt-3 text-sm sm:gap-x-4">
        <button
          onClick={toggleReaction}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2 py-1 transition active:scale-90",
            reacted ? "text-cyan" : "text-muted hover:text-navy",
          )}
        >
          <motion.span
            className="text-base"
            animate={{ scale: reacted ? [1, 1.4, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            👏
          </motion.span>
          {count > 0 && <span>{count}</span>}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 rounded-full px-2 py-1 text-muted transition-colors hover:text-navy"
        >
          <Icon name="chat" size={16} />
          {comments.length > 0 && <span>{comments.length}</span>}
          <span>{P.comments}</span>
        </button>
        <ShareButton postId={post.id} title={post.title} />
        {/* Botón de reporte visible en cada post */}
        <ReportButton targetType="POST" targetId={post.id} className="ml-auto" />
      </div>

      {showComments && (
        <div className="mt-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar name={c.author.name} size={30} />
              <div className="rounded-2xl bg-surface px-3.5 py-2">
                <p className="text-sm font-semibold text-navy">
                  {c.author.name}{" "}
                  <span className="font-normal text-muted">
                    · {timeAgo(new Date(c.createdAt), locale)}
                  </span>
                </p>
                <p className="text-sm text-ink/90">{c.body}</p>
              </div>
            </div>
          ))}
          {loggedIn ? (
            <div className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder={P.addComment}
              />
              <button
                onClick={addComment}
                disabled={busy}
                className="shrink-0 rounded-xl bg-navy px-3 text-white disabled:opacity-50"
                aria-label={dict.common.send}
              >
                <Icon name="arrowRight" size={18} />
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted">{P.loginToPost}</p>
          )}
        </div>
      )}
    </article>
  );
}
