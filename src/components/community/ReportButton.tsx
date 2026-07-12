"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useToast } from "@/components/Toast";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";

/**
 * Visible report button — required on every post and every profile.
 * Two-step: first click asks to confirm, second click files the report.
 */
export function ReportButton({
  targetType,
  targetId,
  className,
}: {
  targetType: "POST" | "MEMBER";
  targetId: string;
  className?: string;
}) {
  const { dict } = useI18n();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    setConfirming(false);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId }),
    });
    if (res.ok) {
      setSent(true);
      toast(dict.common.reported);
    }
  }

  if (sent) return null;

  return (
    <button
      type="button"
      onClick={() => (confirming ? send() : setConfirming(true))}
      onBlur={() => setConfirming(false)}
      className={cn(
        "flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
        confirming ? "font-semibold text-rose-600" : "text-muted/70 hover:text-rose-600",
        className,
      )}
    >
      <Icon name="flag" size={13} />
      {confirming ? dict.common.confirmReport : dict.common.report}
    </button>
  );
}
