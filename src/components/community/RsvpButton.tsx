"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { useToast } from "@/components/Toast";
import { Button, cn } from "@/components/ui";
import { Icon } from "@/components/icons";

export function RsvpButton({
  eventId,
  initialGoing,
  initialCount,
  loggedIn,
}: {
  eventId: string;
  initialGoing: boolean;
  initialCount: number;
  loggedIn: boolean;
}) {
  const { locale, dict } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const [going, setGoing] = useState(initialGoing);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/rsvp`, { method: "POST" });
    if (res.ok) {
      const j = await res.json();
      setGoing(j.going);
      setCount(j.count);
      toast(
        j.going
          ? locale === "es"
            ? "¡Registro confirmado!"
            : "Registration confirmed!"
          : locale === "es"
            ? "Registro cancelado"
            : "Registration cancelled",
      );
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        size="sm"
        variant={going ? "secondary" : "outline"}
        onClick={toggle}
        disabled={loading}
        className={cn("transition-transform active:scale-[0.97]", going && "gap-1.5")}
      >
        {going && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="flex"
          >
            <Icon name="check" size={15} />
          </motion.span>
        )}
        {going ? dict.community.events.registered : dict.community.events.register}
      </Button>
      {count > 0 && (
        <span className="text-xs text-muted">
          {count} {dict.community.events.attendees}
        </span>
      )}
    </div>
  );
}
