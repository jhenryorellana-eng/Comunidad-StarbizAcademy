"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";

export type EpisodeLite = {
  id: string;
  title: string;
  guest: string | null;
  duration: string | null;
  audioUrl: string | null;
};

const PlayerContext = createContext<{
  current: EpisodeLite | null;
  play: (e: EpisodeLite) => void;
} | null>(null);

export function usePodcastPlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePodcastPlayer must be used inside PodcastPlayerProvider");
  return ctx;
}

/**
 * Persistent StarVoice player: lives in the community layout so the audio
 * keeps playing while the user navigates between spaces.
 */
export function PodcastPlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<EpisodeLite | null>(null);
  return (
    <PlayerContext.Provider value={{ current, play: setCurrent }}>
      {children}
      <PlayerBar episode={current} onClose={() => setCurrent(null)} />
    </PlayerContext.Provider>
  );
}

function PlayerBar({
  episode,
  onClose,
}: {
  episode: EpisodeLite | null;
  onClose: () => void;
}) {
  const { dict } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (episode?.audioUrl && audioRef.current) {
      audioRef.current.src = episode.audioUrl;
      audioRef.current.play().catch(() => {});
    }
  }, [episode]);

  return (
    <AnimatePresence>
      {episode && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="fixed inset-x-0 bottom-0 z-40"
        >
          <div className="container-ac pb-2 lg:pb-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-navy/95 px-4 py-3 text-white shadow-[0_-8px_40px_rgba(26,39,68,0.35)] backdrop-blur-xl">
              <span className="animate-led flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan text-white shadow-[0_0_14px_rgba(34,211,238,0.5)]">
                <Icon name="podcast" size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{episode.title}</p>
                <p className="truncate text-xs text-white/60">
                  {episode.audioUrl ? dict.community.podcast.nowPlaying : dict.community.podcast.soon}
                  {episode.guest ? ` · ${episode.guest}` : ""}
                </p>
              </div>
              {episode.audioUrl && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio ref={audioRef} controls className="hidden h-9 w-56 sm:block" />
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label={dict.common.close}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Play button used on each episode card (server list → client action). */
export function PlayEpisodeButton({ episode }: { episode: EpisodeLite }) {
  const { dict } = useI18n();
  const { current, play } = usePodcastPlayer();
  const active = current?.id === episode.id;
  return (
    <button
      type="button"
      onClick={() => play(episode)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
        active
          ? "bg-navy text-white"
          : "bg-cyan text-white shadow-sm hover:-translate-y-px hover:bg-cyan-700 hover:shadow-md",
      )}
    >
      <Icon name="play" size={14} />
      {active ? dict.community.podcast.nowPlaying : dict.community.podcast.listen}
    </button>
  );
}
