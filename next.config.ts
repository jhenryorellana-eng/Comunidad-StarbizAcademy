import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't pick a stray lockfile elsewhere.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Old English routes → the Spanish community routes (spec: /comunidad/*).
  async redirects() {
    return [
      { source: "/community", destination: "/comunidad/posts", permanent: true },
      { source: "/community/members", destination: "/comunidad/miembros", permanent: true },
      { source: "/community/events", destination: "/comunidad/eventos", permanent: true },
      { source: "/community/observatory", destination: "/comunidad/blogs", permanent: true },
      { source: "/community/store", destination: "/comunidad/tienda", permanent: true },
      { source: "/community/chapters", destination: "/comunidad/cohortes", permanent: true },
      { source: "/community/:path*", destination: "/comunidad/:path*", permanent: true },
      { source: "/store", destination: "/comunidad/tienda", permanent: true },
    ];
  },
};

export default nextConfig;
