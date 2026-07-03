import type { Product } from "@prisma/client";
import { whatsappFor } from "@/lib/constants";
import { Badge, cn } from "@/components/ui";
import { Icon } from "@/components/icons";
import type { Dict } from "@/lib/i18n/dictionaries";

function statusBadge(status: string, S: Dict["store"]) {
  switch (status) {
    case "AVAILABLE":
      return { label: S.available, tone: "green" as const };
    case "BETA":
      return { label: S.beta, tone: "cyan" as const };
    default:
      return { label: S.comingSoon, tone: "neutral" as const };
  }
}

export function ProductCard({ p, S }: { p: Product; S: Dict["store"] }) {
  const badge = statusBadge(p.status, S);
  const soon = p.status === "COMING_SOON";
  const href = p.url || whatsappFor(p.name);
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-surface-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/30 hover:shadow-[0_12px_35px_rgba(8,145,178,0.12)]",
        p.featured && "ring-1 ring-gold/60",
      )}
    >
      {/* LED hairline that lights up on hover */}
      <span
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-bright/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl leading-none" aria-hidden>
          {p.icon ?? "⭐"}
        </span>
        <div className="flex items-center gap-1.5">
          {p.featured && (
            <Badge tone="neutral" className="border-gold/40 bg-gold/10 text-gold-700">
              {S.featured}
            </Badge>
          )}
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-bold text-navy">{p.name}</h3>
      <p className="mt-0.5 text-sm font-medium text-cyan-700">{p.tagline}</p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line-soft pt-4">
        <span className="text-sm font-semibold text-navy">{p.price ?? ""}</span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-px active:translate-y-0",
            soon
              ? "border border-navy/25 text-navy hover:bg-navy/[0.04]"
              : "bg-cyan text-white shadow-sm hover:bg-cyan-700 hover:shadow-md",
          )}
        >
          {soon ? S.ctaSoon : p.url ? S.ctaInfo : S.cta}
          <Icon name="arrowRight" size={14} />
        </a>
      </div>
    </div>
  );
}
