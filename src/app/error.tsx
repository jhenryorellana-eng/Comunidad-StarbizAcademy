"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui";
import { StarGlyph } from "@/components/Star";

export default function Error(props: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  const { locale } = useI18n();
  const es = locale === "es";

  useEffect(() => {
    console.error(props.error);
  }, [props.error]);

  const retry =
    props.reset ?? props.unstable_retry ?? (() => window.location.reload());

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <StarGlyph size={56} className="text-cyan" />
      <h1 className="mt-6 font-display text-2xl font-extrabold text-navy">
        {es ? "Algo salió mal" : "Something went wrong"}
      </h1>
      <p className="mt-2 max-w-sm text-muted">
        {es
          ? "Tuvimos un problema cargando esta página."
          : "We hit a problem loading this page."}
      </p>
      <Button className="mt-8" onClick={retry}>
        {es ? "Reintentar" : "Try again"}
      </Button>
    </div>
  );
}
