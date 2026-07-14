"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { useToast } from "@/components/Toast";
import { Button, Input, Label, Spinner } from "@/components/ui";

/** Alta de un CEO Junior desde la cuenta del padre (el registro parental). */
export function AddChildForm() {
  const { dict } = useI18n();
  const F = dict.family;
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const res = await fetch("/api/family/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        birthdate: fd.get("birthdate"),
        building: fd.get("building"),
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(
        j.error === "age"
          ? F.errorAge
          : j.error === "birthdate"
            ? F.errorBirthdate
            : j.error === "exists"
              ? dict.auth.errorExists
              : dict.auth.errorGeneric,
      );
      return;
    }
    form.reset();
    toast(F.created);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="child-name">{F.childName}</Label>
        <Input id="child-name" name="name" required autoComplete="off" />
      </div>
      <div>
        <Label htmlFor="child-birthdate">{F.birthdate}</Label>
        <Input id="child-birthdate" name="birthdate" type="date" required />
        <p className="mt-1 text-xs text-muted">{F.birthdateHint}</p>
      </div>
      <div>
        <Label htmlFor="child-email">{F.childEmail}</Label>
        <Input id="child-email" name="email" type="email" required autoComplete="off" />
      </div>
      <div>
        <Label htmlFor="child-password">{F.childPassword}</Label>
        <Input id="child-password" name="password" type="password" required minLength={6} autoComplete="new-password" />
      </div>
      <div>
        <Label htmlFor="child-building">{F.childBuilding}</Label>
        <Input
          id="child-building"
          name="building"
          required
          maxLength={60}
          placeholder={dict.auth.buildingPlaceholder}
        />
        <p className="mt-1 text-xs text-muted">{F.childBuildingHint}</p>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Spinner /> {dict.common.loading}
          </>
        ) : (
          F.submit
        )}
      </Button>
      <p className="text-center text-xs text-muted">{F.loginHint}</p>
    </form>
  );
}
