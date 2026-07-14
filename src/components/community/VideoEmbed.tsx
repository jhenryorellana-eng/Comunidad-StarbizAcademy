"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { Icon } from "@/components/icons";
import { parseVideoUrl, videoEmbedUrl, videoThumbnail } from "@/lib/video";

/**
 * Reproductor de video del feed con fachada click-to-play: se muestra la
 * miniatura con un botón de play y el iframe pesado recién se monta cuando
 * el usuario decide reproducir (clave para el rendimiento del feed).
 */
export function VideoEmbed({ videoUrl, title }: { videoUrl: string; title: string }) {
  const { dict } = useI18n();
  const [playing, setPlaying] = useState(false);
  const info = parseVideoUrl(videoUrl);
  if (!info) return null;

  const thumb = videoThumbnail(info);

  return (
    <div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-navy shadow-inner">
      {playing ? (
        <iframe
          src={videoEmbedUrl(info)}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={dict.community.posts.playVideo}
          className="group absolute inset-0 h-full w-full"
        >
          {thumb ? (
            <Image
              src={thumb}
              alt=""
              fill
              sizes="(min-width: 640px) 640px, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            // Vimeo no expone miniatura sin API: fondo de marca con brillo
            <span
              className="absolute inset-0 bg-gradient-to-br from-navy via-[#0c1a33] to-cyan-900"
              aria-hidden
            />
          )}
          <span className="absolute inset-0 bg-navy/25 transition-colors group-hover:bg-navy/10" aria-hidden />
          <motion.span
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-navy/70 text-white shadow-[0_0_28px_rgba(34,211,238,0.45)] backdrop-blur-md"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
          >
            <Icon name="play" size={26} className="ml-1 text-cyan-bright" />
          </motion.span>
        </button>
      )}
    </div>
  );
}
