import { getLocale } from "@/lib/i18n/server";
import { LinkButton } from "@/components/ui";
import { StarGlyph } from "@/components/Star";

export default async function NotFound() {
  const es = (await getLocale()) === "es";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <StarGlyph size={56} className="text-cyan" />
      <p className="mt-6 font-display text-7xl font-extrabold text-navy">404</p>
      <p className="mt-3 max-w-sm text-muted">
        {es
          ? "Esta página se perdió entre las estrellas."
          : "This page got lost among the stars."}
      </p>
      <LinkButton href="/" className="mt-8">
        {es ? "Volver al inicio" : "Back home"}
      </LinkButton>
    </div>
  );
}
