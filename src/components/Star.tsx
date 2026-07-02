import Link from "next/link";

/** Small circular star glyph used in the logo — a 4-point "north star". */
export function StarGlyph({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
      <path
        d="M20 7 L23 17 L33 20 L23 23 L20 33 L17 23 L7 20 L17 17 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="29" cy="11" r="1.4" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function Logo({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const color = tone === "light" ? "text-white" : "text-navy";
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 ${color} ${className ?? ""}`}
    >
      <StarGlyph className={tone === "light" ? "text-gold" : "text-gold-700"} />
      <span className="font-display text-[0.92rem] uppercase tracking-[0.18em] leading-none">
        <span className="font-extrabold">Starbiz</span>{" "}
        <span className="font-light">Academy</span>
      </span>
    </Link>
  );
}

/**
 * Constellation divider — a horizon line with star nodes rising toward the
 * right. Place at the bottom of hero/closing sections.
 * `variant` picks colors that sit on a cream or navy background.
 */
export function StarDivider({
  variant = "cream",
  className,
}: {
  variant?: "cream" | "navy";
  className?: string;
}) {
  const c =
    variant === "navy"
      ? { line: "#3b5488", node: "#22d3ee", star: "#fbbf24", strip: "#0891b2" }
      : { line: "#e9e4db", node: "#0891b2", star: "#fbbf24", strip: "#0891b2" };
  // Constellation path: 7 nodes (one per GÉNESIS i7 intelligence), ascending.
  const nodes: Array<[number, number]> = [
    [80, 96], [250, 78], [420, 88], [590, 62], [760, 70], [930, 44], [1100, 28],
  ];
  return (
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className={`block w-full ${className ?? ""}`}
      aria-hidden
    >
      <polyline
        points={nodes.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke={c.line}
        strokeWidth="1.5"
      />
      {nodes.slice(0, -1).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 3 : 4} fill={c.node} opacity="0.85" />
      ))}
      {/* Last node is the brand star */}
      <path
        d="M1100 16 L1103 25 L1112 28 L1103 31 L1100 40 L1097 31 L1088 28 L1097 25 Z"
        fill={c.star}
      />
      <rect x="0" y="112" width="1200" height="8" fill={c.strip} />
    </svg>
  );
}
