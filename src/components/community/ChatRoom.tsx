"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n/client";
import { Avatar, cn } from "@/components/ui";
import { Icon } from "@/components/icons";
import { formatTime } from "@/lib/format";

type ChannelDTO = { id: string; slug: string; name: string; description: string | null };
type MsgDTO = {
  id: string;
  body: string;
  createdAt: string;
  userId: string;
  author: { name: string };
};

export function ChatRoom({
  channels,
  currentUser,
}: {
  channels: ChannelDTO[];
  currentUser: { id: string; name: string };
}) {
  const { locale, dict } = useI18n();
  const [active, setActive] = useState(channels[0]?.slug ?? "");
  const [messages, setMessages] = useState<MsgDTO[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!active) return;
    const res = await fetch(`/api/channels/${active}/messages`, { cache: "no-store" });
    if (res.ok) {
      const j = await res.json();
      setMessages(j.messages);
    }
  }, [active]);

  useEffect(() => {
    setMessages([]);
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setText("");
    const res = await fetch(`/api/channels/${active}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      const j = await res.json();
      setMessages((prev) => [...prev, j.message]);
    }
  }

  const activeChannel = channels.find((c) => c.slug === active);

  return (
    <div className="grid h-[70vh] grid-cols-1 overflow-hidden rounded-2xl border border-surface-line bg-paper sm:grid-cols-[200px_1fr]">
      {/* channels */}
      <div className="border-b border-surface-line bg-surface p-3 sm:border-b-0 sm:border-r">
        <p className="mb-2 px-2 font-display text-xs font-semibold uppercase tracking-wider text-muted">
          {dict.community.chat.channels}
        </p>
        <div className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
          {channels.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.slug)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                active === c.slug
                  ? "bg-navy text-white"
                  : "text-ink hover:bg-navy/[0.05]",
              )}
            >
              # {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* messages */}
      <div className="flex min-h-0 flex-col">
        <div className="border-b border-surface-line px-4 py-3">
          <p className="font-bold text-navy"># {activeChannel?.name}</p>
          {activeChannel?.description && (
            <p className="text-xs text-muted">{activeChannel.description}</p>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">{dict.community.chat.empty}</p>
          ) : (
            messages.map((m) => {
              const mine = m.userId === currentUser.id;
              return (
                <div key={m.id} className={cn("flex gap-2.5", mine && "flex-row-reverse")}>
                  <Avatar name={m.author.name} size={32} />
                  <div className={cn("max-w-[75%]", mine && "text-right")}>
                    <p className="text-xs text-muted">
                      {m.author.name} · {formatTime(new Date(m.createdAt), locale)}
                    </p>
                    <div
                      className={cn(
                        "mt-1 inline-block rounded-2xl px-3.5 py-2 text-sm",
                        mine ? "bg-navy text-white" : "bg-surface text-ink",
                      )}
                    >
                      {m.body}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex gap-2 border-t border-surface-line p-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={dict.community.chat.messagePlaceholder}
            className="flex-1 rounded-full border border-surface-line bg-surface px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
          />
          <button
            onClick={send}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan text-white hover:bg-cyan-700"
            aria-label={dict.common.send}
          >
            <Icon name="arrowRight" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
