"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { useToast } from "@/components/Toast";
import { Avatar, Button, Input, Textarea, cn } from "@/components/ui";
import { Icon } from "@/components/icons";
import { parseVideoUrl } from "@/lib/video";

type Mode = "normal" | "firstSale";

export function PostComposer({
  userName,
  initialOpen = false,
}: {
  userName: string;
  /** true cuando se llega desde la Órbita con la intención de publicar. */
  initialOpen?: boolean;
}) {
  const { locale, dict } = useI18n();
  const P = dict.community.posts;
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [mode, setMode] = useState<Mode>("normal");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [video, setVideo] = useState("");
  const [sale, setSale] = useState({ sold: "", to: "", amount: "", learned: "" });
  const [loading, setLoading] = useState(false);

  const videoInfo = video.trim() ? parseVideoUrl(video) : null;
  const videoOk = !video.trim() || !!videoInfo;
  const saleReady = sale.sold.trim() && sale.to.trim() && sale.amount.trim() && sale.learned.trim();
  const ready =
    mode === "firstSale"
      ? !!(title.trim() && saleReady)
      : !!(title.trim() && body.trim() && videoOk);

  async function submit() {
    if (!ready) return;
    setLoading(true);
    const payload =
      mode === "firstSale"
        ? { title, body: JSON.stringify(sale), category: "FIRST_SALE" }
        : { title, body, videoUrl: video.trim() || undefined };
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      setTitle("");
      setBody("");
      setVideo("");
      setSale({ sold: "", to: "", amount: "", learned: "" });
      setOpen(false);
      setMode("normal");
      toast(locale === "es" ? "Publicación creada" : "Post published");
      router.refresh();
    }
  }

  return (
    <div
      className={cn(
        "mb-6 rounded-2xl border bg-paper p-4 transition-colors",
        mode === "firstSale" && open
          ? "border-cyan/50 shadow-[0_0_24px_rgba(8,145,178,0.12)]"
          : "border-surface-line",
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar name={userName} size={40} />
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex-1 rounded-full border border-surface-line bg-surface px-4 py-2.5 text-left text-sm text-muted transition-colors hover:border-cyan/40"
          >
            {P.composerPlaceholder}
          </button>
        ) : (
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={P.titleLabel}
            className="flex-1"
          />
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {/* Tipo de publicación */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("normal")}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    mode === "normal"
                      ? "border-navy bg-navy text-white"
                      : "border-surface-line text-muted hover:border-navy/30",
                  )}
                >
                  {P.normalCta}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("firstSale")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    mode === "firstSale"
                      ? "border-cyan bg-cyan text-white shadow-[0_0_12px_rgba(8,145,178,0.35)]"
                      : "border-cyan/40 text-cyan-700 hover:bg-cyan-50",
                  )}
                >
                  <Icon name="star" size={13} />
                  {P.firstSaleCta}
                </button>
              </div>

              {mode === "normal" ? (
                <>
                  <Textarea
                    rows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={P.composerPlaceholder}
                  />
                  {/* Video opcional: solo enlaces de YouTube/Vimeo */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                          videoInfo
                            ? "border-cyan/50 bg-cyan-50 text-cyan"
                            : "border-surface-line text-muted",
                        )}
                        aria-hidden
                      >
                        <Icon name="play" size={15} />
                      </span>
                      <Input
                        value={video}
                        onChange={(e) => setVideo(e.target.value)}
                        placeholder={P.videoLabel}
                        className="flex-1"
                      />
                    </div>
                    {video.trim() && !videoInfo && (
                      <p className="mt-1.5 text-xs text-rose-600">{P.videoInvalid}</p>
                    )}
                    {videoInfo && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-cyan-700">
                        <Icon name="check" size={13} />
                        {P.videoReady} · {videoInfo.provider === "youtube" ? "YouTube" : "Vimeo"}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                // "Mi primera venta" — estructurado, no texto libre
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["sold", P.soldWhat],
                      ["to", P.soldTo],
                      ["amount", P.soldAmount],
                      ["learned", P.soldLearned],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className={key === "learned" ? "sm:col-span-2" : ""}>
                      <label className="mb-1 block text-xs font-semibold text-navy">
                        {label}
                      </label>
                      {key === "learned" ? (
                        <Textarea
                          rows={2}
                          value={sale[key]}
                          onChange={(e) => setSale((s) => ({ ...s, [key]: e.target.value }))}
                        />
                      ) : (
                        <Input
                          value={sale[key]}
                          onChange={(e) => setSale((s) => ({ ...s, [key]: e.target.value }))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  {dict.common.cancel}
                </Button>
                <Button size="sm" onClick={submit} disabled={loading || !ready}>
                  {loading ? dict.common.loading : P.publish}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
