"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { Avatar, Badge, Input, cn } from "@/components/ui";
import { Icon } from "@/components/icons";
import { timeAgo } from "@/lib/format";

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
  createdAt: string;
  author: { name: string; role: string; createdAt: string };
  reactionCount: number;
  reactedByMe: boolean;
  comments: CommentDTO[];
};

export function PostFeed({
  posts,
  loggedIn,
}: {
  posts: PostDTO[];
  loggedIn: boolean;
}) {
  const { dict } = useI18n();
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-line bg-paper p-12 text-center text-muted">
        {dict.community.posts.empty}
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} loggedIn={loggedIn} />
      ))}
    </div>
  );
}

function PostCard({ post, loggedIn }: { post: PostDTO; loggedIn: boolean }) {
  const { locale, dict } = useI18n();
  const P = dict.community.posts;
  const [reacted, setReacted] = useState(post.reactedByMe);
  const [count, setCount] = useState(post.reactionCount);
  const [comments, setComments] = useState<CommentDTO[]>(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

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
    <article className="rounded-2xl border border-surface-line bg-paper p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-bold leading-snug text-navy">{post.title}</h2>
        {catBadge && <Badge tone="cyan">{catBadge}</Badge>}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Avatar name={post.author.name} size={38} />
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

      <p className="mt-4 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink/90">
        {post.body}
      </p>

      <div className="mt-4 flex items-center gap-4 border-t border-surface-line pt-3 text-sm">
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
