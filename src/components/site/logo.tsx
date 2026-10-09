"use client";

import * as React from "react";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

export interface LogoProps {
  /** "light" for warm-white backgrounds, "dark" for graphite backgrounds. */
  variant?: "light" | "dark";
  withWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

/** ETARNITY orbit mark — circle + tilted ellipse ring + periwinkle satellite. */
function OrbitMark({ gradientId }: { gradientId: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="h-8 w-8 shrink-0"
    >
      <circle cx="32" cy="32" r="11" fill={`url(#${gradientId})`} />
      <ellipse
        cx="32"
        cy="32"
        rx="24"
        ry="9.5"
        stroke="#526BFF"
        strokeWidth="2.4"
        transform="rotate(-24 32 32)"
      />
      <circle cx="50.2" cy="22.4" r="3" fill="#AAB7FF" />
      <defs>
        <linearGradient
          id={gradientId}
          x1="24"
          y1="24"
          x2="40"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E9EDF5" />
          <stop offset="0.55" stopColor="#AAB7FF" />
          <stop offset="1" stopColor="#526BFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  variant = "light",
  withWordmark = true,
  className,
  onClick,
}: LogoProps) {
  const gradientId = React.useId().replace(/:/g, "");

  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="ETARNITY — home"
      className={cn(
        "inline-flex items-center gap-3 rounded-md transition-opacity hover:opacity-80",
        className
      )}
    >
      <OrbitMark gradientId={`etarnity-orbit-${gradientId}`} />
      {withWordmark && (
        <span
          className={cn(
            "text-sm font-semibold tracking-[0.18em]",
            variant === "dark" ? "text-warmwhite" : "text-graphite"
          )}
        >
          ETARNITY
        </span>
      )}
    </Link>
  );
}

export default Logo;
