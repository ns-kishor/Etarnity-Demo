"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { api, toastError } from "./admin-utils";
import type { AdminUser } from "@/lib/types";

export default function AdminLogin({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { user } = await api<{ user: AdminUser }>(
        "/api/admin/login",
        "POST",
        { email: email.trim(), password }
      );
      onLogin(user);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not sign in. Please try again.";
      setError(message);
      toastError("Sign-in failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-graphite px-6">
      {/* Radial periwinkle glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at 50% 35%, rgba(170,183,255,0.16), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px circle at 85% 90%, rgba(82,107,255,0.08), transparent 65%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow-[0_24px_80px_rgba(21,23,27,0.45)]">
          <Logo variant="light" />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
            ETARNITY Admin
          </p>
          <h1 className="mt-2 text-lg font-semibold tracking-tight text-graphite">
            Sign in to continue
          </h1>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-email"
                className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@etarnity.com"
                className="h-11 rounded-md border border-hairline bg-white px-3 text-sm text-graphite outline-none transition-colors placeholder:text-ink-soft/60 focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric/30"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-password"
                className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-md border border-hairline bg-white px-3 text-sm text-graphite outline-none transition-colors placeholder:text-ink-soft/60 focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric/30"
              />
            </div>

            {error ? (
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-graphite py-3 text-sm font-medium text-warmwhite transition-colors hover:bg-[#23262D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dark-soft">
          ETARNITY — internal access only
        </p>
      </div>
    </div>
  );
}
