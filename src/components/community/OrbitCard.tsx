"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { useToast } from "@/components/Toast";
import { Avatar, Input, cn } from "@/components/ui";
import { Icon } from "@/components/icons";
import { timeAgo } from "@/lib/format";
import { ReportButton } from "./ReportButton";
import { VideoEmbed } from "./VideoEmbed";
import { parseFirstSale, type CommentDTO, type PostDTO } from "./PostFeed";
import { postShareUrl, tryNativeShare } from "./ShareButton";

const DOUBLE_TAP_MS = 320;
const BODY_CLAMP_CHARS = 260;

type Burst = { id: number; x: number; y: number };

/**
 * Una parada de la Órbita: el post a pantalla completa en una tarjeta de
 * vidrio sobre el cielo, con riel de acciones lateral (como los feeds que
 * esta generación ya domina) y doble toque = aplauso con estrella dorada.
 */
export function OrbitCard({
  post,
  loggedIn,
  active,
}: {
  post: PostDTO;
  loggedIn: boolean;
  active: boolean;
}) {
  const { locale, dict } = useI18n();
  const P = dict.community.posts;
  const toast = useToast();
  const [reacted, setReacted] = useState(post.reactedByMe);
  const [count, setCount] = useState(post.reactionCount);
  const [comments, setComments] = useState<CommentDTO[]>(post.comments);
  const [sheet, setSheet] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const lastTap = useRef(0);
  const burstId = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const firstSale = post.category === "FIRST_SALE" ? parseFirstSale(post.body) : null;
  const longBody = !firstSale && post.body.length > BODY_CLAMP_CHARS;

  async function applaud() {
    if (!loggedIn) {
      window.location.href = "/login";
      return;
    }
    setReacted((r) => !r);
    setCount((c) => c + (reacted ? -1 : 1));
    const res = await fetch(`/api/posts/${post.id}/reactions`, { method: "POST" });
    if (res.ok) {
      const j = await res.json();
      setReacted(j.reacted);
      setCount(j.count);
    }
  }

  // Doble toque en la tarjeta: aplauso + estrella dorada donde tocaste.
  function onTap(e: React.PointerEvent) {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        setBursts((b) => [
          ...b,
          { id: ++burstId.current, x: e.clientX - rect.left, y: e.clientY - rect.top },
        ]);
      }
      if (!reacted) applaud();
    }
    lastTap.current = now;
  }

  async function share() {
    const url = postShareUrl(post.id);
    if (await tryNativeShare(post.title, url)) return;
    try {
      await navigator.clipboard.writeText(url);
      toast(P.linkCopied);
    } catch {
      toast(P.copyFailed, "error");
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

  const badge =
    post.category === "FIRST_SALE"
      ? P.firstSaleBadge
      : post.category === "ANNOUNCEMENT"
        ? locale === "es" ? "Anuncio" : "Announcement"
        : post.category === "VOICE"
          ? locale === "es" ? "Voz" : "Voice"
          : null;

  return (
    <div className="relative w-full max-w-xl">
      {/* Tarjeta de vidrio: el cielo se ve a través */}
      <div
        ref={cardRef}
        onPointerDown={onTap}
        className={cn(
          // select-none: el doble toque aplaude, no selecciona texto
          "relative select-none overflow-hidden rounded-3xl border bg-white/[0.05] p-6 pr-16 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8 sm:pr-20",
          post.category === "FIRST_SALE" ? "border-gold/40" : "border-white/[0.12]",
        )}
      >
        {post.category === "FIRST_SALE" && (
          <span
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent"
            aria-hidden
          />
        )}

        <div className="flex items-center gap-2.5 text-xs">
          {badge && (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 font-semibold",
                post.category === "FIRST_SALE"
                  ? "bg-gold/15 text-gold"
                  : "bg-cyan-bright/15 text-cyan-bright",
              )}
            >
              {post.category === "FIRST_SALE" ? "⭐ " : ""}
              {badge}
            </span>
          )}
          <span className="text-white/45">{timeAgo(new Date(post.createdAt), locale)}</span>
          <ReportButton
            targetType="POST"
            targetId={post.id}
            className="ml-auto text-white/40 hover:text-rose-400"
          />
        </div>

        <h2 className="mt-3 font-display text-[1.55rem] font-bold leading-tight text-white sm:text-3xl [text-wrap:balance]">
          {post.title}
        </h2>

        {firstSale ? (
          <dl className="mt-4 space-y-2.5 rounded-2xl bg-cyan-bright/[0.08] p-4 ring-1 ring-cyan-bright/15">
            {(
              [
                [P.soldWhat, firstSale.sold],
                [P.soldTo, firstSale.to],
                [P.soldAmount, firstSale.amount],
                [P.soldLearned, firstSale.learned],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-cyan-bright/90">
                  {label}
                </dt>
                <dd className="text-sm leading-relaxed text-[#dbe3f5]">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <>
            <p
              className={cn(
                "mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed text-[#c3cde6] sm:text-base",
                longBody && !expanded && "line-clamp-5",
              )}
            >
              {post.body}
            </p>
            {longBody && (
              <button
                type="button"
                onClick={() => setExpanded((x) => !x)}
                className="mt-1 text-sm font-semibold text-cyan-bright"
              >
                {expanded ? dict.common.close : locale === "es" ? "Ver más" : "See more"}
              </button>
            )}
          </>
        )}

        {post.videoUrl && (
          // Al salir de la tarjeta el video se desmonta: nada suena fuera de foco.
          <VideoEmbed key={active ? "on" : "off"} videoUrl={post.videoUrl} title={post.title} />
        )}

        <div className="mt-5 flex items-center gap-2.5 border-t border-white/10 pt-4">
          <Avatar name={post.author.name} size={34} />
          <div className="text-sm">
            <p className="font-semibold text-white">{post.author.name}</p>
            <p className="text-xs text-white/45">
              {dict.community.membersDir.memberSince}{" "}
              {new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
                month: "long",
                year: "numeric",
              }).format(new Date(post.author.createdAt))}
            </p>
          </div>
        </div>

        {/* Estrellas del doble toque */}
        {bursts.map((b) => (
          <motion.span
            key={b.id}
            className="pointer-events-none absolute z-30 text-4xl text-gold drop-shadow-[0_0_14px_rgba(251,191,36,0.9)]"
            style={{ left: b.x - 18, top: b.y - 18 }}
            initial={{ scale: 0.3, opacity: 1, rotate: -20 }}
            animate={{ scale: 1.9, opacity: 0, rotate: 15, y: -34 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onAnimationComplete={() =>
              setBursts((list) => list.filter((x) => x.id !== b.id))
            }
            aria-hidden
          >
            ✦
          </motion.span>
        ))}

        {/* Riel de acciones (dentro del vidrio, borde derecho) */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-6 right-3 z-20 flex flex-col items-center gap-3.5 sm:right-4"
        >
          <RailButton
            label={`${count > 0 ? count : ""}`}
            aria={locale === "es" ? "Aplaudir" : "Applaud"}
            onClick={applaud}
            activeStyle={reacted}
          >
            <motion.span animate={{ scale: reacted ? [1, 1.35, 1] : 1 }} className="text-lg">
              👏
            </motion.span>
          </RailButton>
          <RailButton
            label={`${comments.length > 0 ? comments.length : ""}`}
            aria={P.comments}
            onClick={() => setSheet(true)}
          >
            <Icon name="chat" size={19} />
          </RailButton>
          <RailButton label="" aria={P.share} onClick={share}>
            <Icon name="share" size={19} />
          </RailButton>
        </div>
      </div>

      {/* Hoja de comentarios */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.button
              type="button"
              aria-label={dict.common.close}
              onClick={() => setSheet(false)}
              className="fixed inset-0 z-40 cursor-default bg-black/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[70dvh] flex-col rounded-t-3xl border-t border-white/12 bg-[#0a1020]/95 backdrop-blur-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20" aria-hidden />
              <p className="px-5 pb-2 pt-3 text-sm font-semibold text-white">
                {P.comments} {comments.length > 0 && `· ${comments.length}`}
              </p>
              <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
                {comments.length === 0 && (
                  <p className="py-6 text-center text-sm text-white/40">{P.empty}</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <Avatar name={c.author.name} size={30} />
                    <div className="rounded-2xl bg-white/[0.07] px-3.5 py-2">
                      <p className="text-sm font-semibold text-white">
                        {c.author.name}{" "}
                        <span className="font-normal text-white/40">
                          · {timeAgo(new Date(c.createdAt), locale)}
                        </span>
                      </p>
                      <p className="text-sm text-[#c3cde6]">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {loggedIn ? (
                  <div className="flex gap-2">
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addComment()}
                      placeholder={P.addComment}
                      className="border-white/15 bg-white/[0.07] text-white placeholder:text-white/35"
                    />
                    <button
                      onClick={addComment}
                      disabled={busy}
                      className="shrink-0 rounded-xl bg-cyan px-3.5 text-white disabled:opacity-50"
                      aria-label={dict.common.send}
                    >
                      <Icon name="arrowRight" size={18} />
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-sm text-white/50">
                    {P.loginToPost}{" "}
                    <Link href="/login" className="font-semibold text-cyan-bright hover:underline">
                      {dict.common.login}
                    </Link>
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function RailButton({
  children,
  label,
  aria,
  onClick,
  activeStyle = false,
}: {
  children: React.ReactNode;
  label: string;
  aria: string;
  onClick: () => void;
  activeStyle?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={onClick}
        aria-label={aria}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-90",
          activeStyle
            ? "border-gold/60 bg-gold/20 text-gold shadow-[0_0_16px_rgba(251,191,36,0.35)]"
            : "border-white/15 bg-white/[0.08] text-white hover:bg-white/15",
        )}
      >
        {children}
      </button>
      {label && <span className="text-[11px] font-medium text-white/70">{label}</span>}
    </div>
  );
}
