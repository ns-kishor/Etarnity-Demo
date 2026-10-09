"use client";

import * as React from "react";
import { useRouter } from "@/lib/router";
import { LoadingState } from "@/components/site/states";
import { api } from "./admin-utils";
import AdminLogin from "./admin-login";
import AdminShell from "./admin-shell";
import type { AdminUser } from "@/lib/types";

/**
 * ETARNITY admin application.
 *
 * Rendered standalone (no public header/footer) for any "#/admin…" route:
 * auth gate (GET /api/admin/me) → AdminLogin or AdminShell. Deep links into
 * a specific section (/admin/businesses…) are preserved by the router, and
 * unauthenticated visitors always land on the login screen.
 */
export default function AdminApp() {
  const router = useRouter();
  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user: me } = await api<{ user: AdminUser }>("/api/admin/me");
        if (!cancelled) setUser(me);
      } catch {
        // No session — the login screen handles credentials.
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warmwhite">
        <LoadingState label="Checking session" />
      </div>
    );
  }

  if (!user) {
    return (
      <AdminLogin
        onLogin={(loggedIn) => {
          setUser(loggedIn);
          // Ensure we sit on a concrete section after signing in.
          if (router.path === "/admin" || router.path.startsWith("/admin")) return;
          router.navigate("/admin");
        }}
      />
    );
  }

  return (
    <AdminShell
      user={user}
      onLogout={() => {
        setUser(null);
        router.navigate("/admin");
      }}
    />
  );
}
