"use client";

/**
 * Minimal data-fetching hook with an in-memory cache.
 *
 *   const { data, loading, error, refresh } = useApi<Business[]>("/api/public/businesses");
 *
 * - `url: null` → idle (no request, loading=false).
 * - Concurrent hooks sharing a URL dedupe onto a single in-flight request.
 * - `refresh()` bypasses the cache (and any in-flight request) and re-fetches.
 * - Non-2xx responses surface the JSON `{ error }` message (or statusText).
 */

import * as React from "react";

/* Module-level cache shared by every useApi consumer. */
const responseCache = new Map<string, unknown>();
const inflightRequests = new Map<string, Promise<unknown>>();

async function requestJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    let message = res.statusText || `Request failed with status ${res.status}`;
    try {
      const body: unknown = await res.json();
      if (
        body &&
        typeof body === "object" &&
        typeof (body as { error?: unknown }).error === "string"
      ) {
        message = (body as { error: string }).error;
      }
    } catch {
      /* body was not JSON — keep statusText */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export interface UseApiResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useApi<T>(url: string | null): UseApiResult<T> {
  const [data, setData] = React.useState<T | undefined>(() => {
    if (!url) return undefined;
    const cached = responseCache.get(url);
    return cached !== undefined ? (cached as T) : undefined;
  });
  const [loading, setLoading] = React.useState<boolean>(() => {
    if (!url) return false;
    return !responseCache.has(url);
  });
  const [error, setError] = React.useState<string | null>(null);
  const [nonce, setNonce] = React.useState(0);

  const bypassCacheRef = React.useRef(false);
  const dataUrlRef = React.useRef<string | null>(
    data !== undefined ? url : null
  );

  React.useEffect(() => {
    const bypass = bypassCacheRef.current;
    bypassCacheRef.current = false;

    if (!url) {
      dataUrlRef.current = null;
      setData(undefined);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const cached = responseCache.get(url);
    if (!bypass && cached !== undefined) {
      dataUrlRef.current = url;
      setData(cached as T);
      setLoading(false);
      setError(null);
      return;
    }

    // Drop stale data belonging to a previous URL before fetching the new one.
    if (dataUrlRef.current !== url) {
      dataUrlRef.current = url;
      setData(undefined);
    }
    setLoading(true);
    setError(null);

    let promise: Promise<unknown>;
    const existing = inflightRequests.get(url);
    if (!bypass && existing) {
      promise = existing; // dedupe onto the in-flight request
    } else {
      promise = requestJson<T>(url);
      inflightRequests.set(url, promise);
    }

    promise
      .then((result) => {
        responseCache.set(url, result);
        if (cancelled) return;
        dataUrlRef.current = url;
        setData(result as T);
        setLoading(false);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
        setLoading(false);
      })
      .finally(() => {
        if (inflightRequests.get(url) === promise) {
          inflightRequests.delete(url);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, nonce]);

  const refresh = React.useCallback(() => {
    if (!url) return;
    bypassCacheRef.current = true;
    setNonce((n) => n + 1);
  }, [url]);

  return { data, loading, error, refresh };
}
