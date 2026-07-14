// Video embeds en posts: solo YouTube y Vimeo (plataformas con moderación
// propia y player embebible). El parser corre en cliente (preview del
// composer) y en servidor (validación del API) — sin dependencias.

export type VideoInfo = { provider: "youtube" | "vimeo"; id: string };

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const YT_PATH = /^\/(?:shorts|live|embed)\/([A-Za-z0-9_-]{11})(?:$|[/?])/;
const VIMEO_PATH = /^\/(\d{6,12})(?:$|[/?])/;
const VIMEO_PLAYER_PATH = /^\/video\/(\d{6,12})(?:$|[/?])/;

/** Devuelve proveedor+id si la URL es un video válido de YouTube/Vimeo. */
export function parseVideoUrl(raw: string): VideoInfo | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, "");

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v && YT_ID.test(v)) return { provider: "youtube", id: v };
    const m = url.pathname.match(YT_PATH);
    return m ? { provider: "youtube", id: m[1] } : null;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return YT_ID.test(id) ? { provider: "youtube", id } : null;
  }
  if (host === "vimeo.com") {
    const m = url.pathname.match(VIMEO_PATH);
    return m ? { provider: "vimeo", id: m[1] } : null;
  }
  if (host === "player.vimeo.com") {
    const m = url.pathname.match(VIMEO_PLAYER_PATH);
    return m ? { provider: "vimeo", id: m[1] } : null;
  }
  return null;
}

/** URL del iframe (autoplay: se monta recién cuando el usuario pulsa play). */
export function videoEmbedUrl(v: VideoInfo): string {
  return v.provider === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`
    : `https://player.vimeo.com/video/${v.id}?autoplay=1`;
}

/** Miniatura para la fachada click-to-play (Vimeo no expone una sin API). */
export function videoThumbnail(v: VideoInfo): string | null {
  return v.provider === "youtube" ? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` : null;
}
