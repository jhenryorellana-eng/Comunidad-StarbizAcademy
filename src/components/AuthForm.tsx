"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n/client";
import { Button, Input, Label, Spinner } from "./ui";
import { Icon } from "./icons";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { dict } = useI18n();
  const A = dict.auth;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    setLoading(true);
    // El registro público es SOLO para padres/tutores; los CEO Junior se
    // agregan después desde "Mi familia".
    const payload =
      mode === "signup"
        ? {
            name: fd.get("name"),
            email: fd.get("email"),
            password: fd.get("password"),
            building: fd.get("building"),
          }
        : { email: fd.get("email"), password: fd.get("password") };

    const res = await fetch(`/api/auth/${mode === "signup" ? "register" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(
        j.error === "exists"
          ? A.errorExists
          : j.error === "invalid"
            ? A.errorInvalid
            : A.errorGeneric,
      );
      setLoading(false);
      return;
    }
    const { user } = await res.json();
    router.refresh();
    // El padre recién registrado aterriza en Mi familia para agregar a sus hijos.
    router.push(
      user.role === "ADMIN" ? "/admin" : mode === "signup" ? "/familia" : "/comunidad",
    );
  }

  return (
    <motion.div
      className="w-full max-w-md rounded-2xl border border-line bg-paper p-8 shadow-sm"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
    >
      <h1 className="text-2xl font-extrabold text-navy">
        {mode === "signup" ? A.signupTitle : A.loginTitle}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "signup" ? A.signupSubtitle : A.loginSubtitle}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <div>
            <Label htmlFor="name">{dict.common.name}</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
        )}
        <div>
          <Label htmlFor="email">{dict.common.email}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">{dict.common.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={mode === "signup" ? 6 : undefined}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </div>

        {mode === "signup" && (
          <>
            {/* "Qué estoy construyendo" es obligatorio: ese campo ES el producto. */}
            <div>
              <Label htmlFor="building">{A.building}</Label>
              <Input
                id="building"
                name="building"
                required
                maxLength={60}
                placeholder={A.buildingPlaceholder}
              />
              <p className="mt-1 text-xs text-muted">{A.buildingHint}</p>
            </div>

            {/* Registro parental: aquí solo se registran adultos responsables. */}
            <div className="flex items-start gap-2.5 rounded-xl border border-cyan/30 bg-cyan-50/50 p-3 text-sm text-ink">
              <span className="mt-0.5 shrink-0 text-cyan" aria-hidden>
                <Icon name="shieldCheck" size={17} />
              </span>
              {A.signupNote}
            </div>
          </>
        )}

        {error && (
          <motion.p
            key={error}
            animate={{ x: [0, -8, 8, -6, 6, 0] }}
            transition={{ duration: 0.4 }}
            className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </motion.p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Spinner /> {dict.common.loading}
            </>
          ) : mode === "signup" ? (
            A.submitSignup
          ) : (
            A.submitLogin
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {mode === "signup" ? A.haveAccount : A.noAccount}{" "}
        <Link
          href={mode === "signup" ? "/login" : "/signup"}
          className="font-semibold text-cyan hover:underline"
        >
          {mode === "signup" ? dict.common.login : dict.common.signup}
        </Link>
      </p>
    </motion.div>
  );
}
