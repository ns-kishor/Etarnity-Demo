"use client";

/**
 * ETARNITY hash-based client-side router.
 *
 * The site is a single-route Next.js app ("/") — all navigation happens through
 * the URL hash (`#/company`, `#/businesses/etar-ai`, `#/admin`, …). This module
 * exposes the routing primitives every page/component uses:
 *
 *   useRouter()      — { path, segments, navigate }
 *   <Link to="…">   — hash anchor with full anchor-props passthrough
 *   useRouteActive()— nav highlighting helper
 */

import * as React from "react";

export interface RouteState {
  path: string;
  segments: string[];
}

export type Router = RouteState & {
  navigate: (to: string) => void;
};

const HOME_TITLE = "ETARNITY — Building What Comes Next";
const TITLE_SUFFIX = " — ETARNITY";

const TITLE_MAP: Record<string, string> = {
  "/": HOME_TITLE,
  "/company": "Company",
  "/company/mission-vision": "Mission & Vision",
  "/businesses": "Businesses",
  "/technology": "Technology",
  "/work": "Work",
  "/people": "People",
  "/insights": "Insights",
  "/careers": "Careers",
  "/contact": "Contact",
  "/privacy-policy": "Privacy Policy",
  "/terms": "Terms",
  "/admin": "Admin",
};

function normalize(to: string): string {
  if (!to) return "/";
  const stripped = to.replace(/^#/, "");
  if (!stripped) return "/";
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

function parseHash(): string {
  if (typeof window === "undefined") return "/";
  return normalize(window.location.hash);
}

function pathToSegments(path: string): string[] {
  return path.split("/").filter(Boolean);
}

function titleForPath(path: string): string {
  if (path === "/") return HOME_TITLE;
  const exact = TITLE_MAP[path];
  if (exact) return `${exact}${TITLE_SUFFIX}`;
  // Detail routes ("/businesses/slug", "/admin/…") inherit the closest
  // known parent title ("Businesses — ETARNITY", "Admin — ETARNITY").
  let best: string | null = null;
  let bestLength = 0;
  for (const key of Object.keys(TITLE_MAP)) {
    if (key === "/") continue;
    if (path.startsWith(`${key}/`) && key.length > bestLength) {
      best = TITLE_MAP[key];
      bestLength = key.length;
    }
  }
  if (best) return `${best}${TITLE_SUFFIX}`;
  return `Page Not Found${TITLE_SUFFIX}`;
}

/** Every title the router itself may set (used to detect page-level overrides). */
const ROUTER_TITLES = new Set<string>([
  HOME_TITLE,
  ...Object.values(TITLE_MAP).map((t) => `${t}${TITLE_SUFFIX}`),
  `Page Not Found${TITLE_SUFFIX}`,
]);

export function useRouter(): Router {
  // Initialized to "/" so the first client render matches the server
  // (SSR has no location.hash); synced to the real hash right after mount.
  const [path, setPath] = React.useState<string>("/");

  React.useEffect(() => {
    const sync = () => setPath(parseHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const segments = React.useMemo(() => pathToSegments(path), [path]);

  const navigate = React.useCallback((to: string) => {
    const target = normalize(to);
    if (parseHash() === target) return;
    window.location.hash = target;
  }, []);

  React.useEffect(() => {
    const next = titleForPath(path);
    const apply = () => {
      if (document.title !== next) document.title = next;
    };
    apply();
    // Next.js may re-apply the SSR <title> metadata once hydration fully
    // settles, which can clobber the client-side title for deep-linked hash
    // routes (verified: a fresh load of #/work ended up titled "/"). Re-assert
    // shortly after — but only reclaim titles the router itself owns, so
    // page-level titles (e.g. per-article <title>s) are always respected.
    const reassert = () => {
      if (document.title === next || ROUTER_TITLES.has(document.title)) {
        apply();
      }
    };
    const raf = requestAnimationFrame(reassert);
    const timer = setTimeout(reassert, 600);
    const timer2 = setTimeout(reassert, 1500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [path]);

  return { path, segments, navigate };
}

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={`#${normalize(to)}`} {...rest}>
      {children}
    </a>
  );
}

/** Exact match for "/", prefix match for everything else. */
export function useRouteActive(target: string): boolean {
  const { path } = useRouter();
  const normalized = normalize(target);
  if (normalized === "/") return path === "/";
  return path === normalized || path.startsWith(`${normalized}/`);
}

export default Link;
