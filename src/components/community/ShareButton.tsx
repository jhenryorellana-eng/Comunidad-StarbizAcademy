"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { useToast } from "@/components/Toast";
import { Icon } from "@/components/icons";

/** Enlace público de un post (destino de todo lo compartido). */
export function postShareUrl(postId: string): string {
  return `${window.location.origin}/comunidad/posts/${postId}`;
}

/**
 * Intenta la hoja de compartir nativa (en móvil incluye WhatsApp).
 * Devuelve true si el sistema se hizo cargo — compartió o el usuario la cerró.
 */
export async function tryNativeShare(title: string, url: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !("share" in navigator)) return false;
  try {
    await navigator.share({ title, url });
    return true;
  } catch (err) {
    return (err as DOMException)?.name === "AbortError";
  }
}

/**
 * Compartir un post: usa la hoja nativa del sistema cuando existe y si no,
 * abre un mini menú con WhatsApp y "Copiar enlace". El enlace apunta al
 * detalle del post.
 */
export function ShareButton({ postId, title }: { postId: string; title: string }) {
  const { dict } = useI18n();
  const P = dict.community.posts;
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const postUrl = () => postShareUrl(postId);

  async function onShare() {
    if (await tryNativeShare(title, postUrl())) return;
    setOpen((o) => !o);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl());
      toast(P.linkCopied);
    } catch {
      toast(P.copyFailed, "error");
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onShare}
        className="flex items-center gap-1.5 rounded-full px-2 py-1 text-muted transition-colors hover:text-navy"
      >
        <Icon name="share" size={16} />
        <span>{P.share}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label={dict.common.close}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-10 cursor-default"
              tabIndex={-1}
            />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
              className="absolute bottom-full left-0 z-20 mb-2 w-48 overflow-hidden rounded-xl border border-surface-line bg-paper py-1 shadow-lg"
            >
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${postUrl()}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink transition-colors hover:bg-surface"
              >
                <Icon name="chat" size={15} className="text-cyan" />
                WhatsApp
              </a>
              <button
                type="button"
                onClick={copyLink}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-ink transition-colors hover:bg-surface"
              >
                <Icon name="external" size={15} className="text-cyan" />
                {P.copyLink}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
