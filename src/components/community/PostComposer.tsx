"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { useToast } from "@/components/Toast";
import { Avatar, Button, Input, Textarea } from "@/components/ui";

export function PostComposer({ userName }: { userName: string }) {
  const { locale, dict } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    setLoading(false);
    if (res.ok) {
      setTitle("");
      setBody("");
      setOpen(false);
      toast(locale === "es" ? "Publicación creada" : "Post published");
      router.refresh();
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-surface-line bg-paper p-4">
      <div className="flex items-center gap-3">
        <Avatar name={userName} size={40} />
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex-1 rounded-full border border-surface-line bg-surface px-4 py-2.5 text-left text-sm text-muted hover:border-navy/30"
          >
            {dict.community.posts.createPlaceholder}
          </button>
        ) : (
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.common.name}
            className="flex-1"
          />
        )}
      </div>
      {open && (
        <div className="mt-3 space-y-3">
          <Textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={dict.community.posts.createPlaceholder}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              {dict.common.cancel}
            </Button>
            <Button size="sm" onClick={submit} disabled={loading}>
              {loading ? dict.common.loading : dict.community.posts.publish}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
