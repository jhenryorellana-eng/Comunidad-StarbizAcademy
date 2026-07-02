import type { SVGProps } from "react";

// Minimal 24x24 stroke icons. Add by key as needed.
const paths: Record<string, string> = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  posts: "M4 5h16v11H8l-4 4V5z",
  events: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4",
  podcast: "M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4zM6 11a6 6 0 0012 0M12 17v4",
  chat: "M4 5h16v10H9l-5 4V5z",
  members: "M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 10a3 3 0 100-6 3 3 0 000 6zM21 19v-1a4 4 0 00-3-3.8M16 4.2a3 3 0 010 5.6",
  observatory: "M12 3v2M12 19v2M3 12h2M19 12h2M12 8a4 4 0 100 8 4 4 0 000-8zM6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4",
  chapters: "M4 5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM13 3v5h5",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  heart: "M12 21s-7-4.5-9.5-9A5 5 0 0112 5a5 5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z",
  pin: "M12 21s-6-5.7-6-10a6 6 0 1112 0c0 4.3-6 10-6 10zM12 11a2 2 0 100-4 2 2 0 000 4z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  check: "M5 13l4 4L19 7",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  lock: "M6 11h12v9H6zM9 11V8a3 3 0 016 0v3",
  plus: "M12 5v14M5 12h14",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  external: "M14 5h5v5M19 5l-8 8M12 5H6a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-6",
  sparkles: "M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5L12 4z",
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 20,
  ...props
}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
