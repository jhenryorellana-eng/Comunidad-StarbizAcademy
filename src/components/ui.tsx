import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- Button ---------------- */
type Variant = "primary" | "secondary" | "outline" | "ghost" | "outlineLight";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-cyan text-white hover:bg-cyan-700 hover:shadow-md border border-transparent shadow-sm",
  secondary:
    "bg-navy text-white hover:bg-navy-700 border border-transparent shadow-sm",
  outline:
    "bg-transparent text-navy border border-navy/25 hover:border-navy/50 hover:bg-navy/[0.03]",
  outlineLight:
    "bg-white/10 text-white border border-white/25 backdrop-blur-md hover:bg-white/[0.18]",
  ghost: "bg-transparent text-navy hover:bg-navy/[0.05] border border-transparent",
};
const sizes: Record<Size, string> = {
  sm: "text-sm px-3.5 py-1.5 rounded-full",
  md: "text-sm px-5 py-2.5 rounded-full",
  lg: "text-base px-7 py-3 rounded-full",
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & ComponentProps<"button">;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(buttonBase, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href">;

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link href={href} className={cn(buttonBase, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}

/* ---------------- Card ---------------- */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-surface-line bg-paper transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan/25 hover:shadow-[0_10px_30px_rgba(8,145,178,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------------- Badge / Pill ---------------- */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "cyan" | "navy" | "green" | "live";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-cream-200 text-ink border-line",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan/20",
    navy: "bg-navy text-white border-transparent",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    live: "bg-rose-50 text-rose-600 border-rose-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {tone === "live" && (
        <span
          className="animate-led h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_1px_rgba(239,68,68,0.8)]"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

/* ---------------- Avatar (initials) ---------------- */
const avatarColors = [
  "bg-cyan text-white",
  "bg-navy text-white",
  "bg-emerald-600 text-white",
  "bg-amber-600 text-white",
  "bg-sky-700 text-white",
  "bg-rose-600 text-white",
];
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const color =
    avatarColors[
      [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % avatarColors.length
    ];
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold",
        color,
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/* ---------------- Form fields ---------------- */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-surface-line bg-paper px-3.5 py-2.5 text-sm text-navy placeholder:text-muted/70",
        "focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20",
        className,
      )}
      {...props}
    />
  );
}
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-surface-line bg-paper px-3.5 py-2.5 text-sm text-navy placeholder:text-muted/70",
        "focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20",
        className,
      )}
      {...props}
    />
  );
}
export function Label({ children, className, ...props }: ComponentProps<"label">) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-navy", className)} {...props}>
      {children}
    </label>
  );
}

/* ---------------- Section kicker ---------------- */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("kicker", className)}>{children}</p>;
}

/* ---------------- Spinner ---------------- */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
