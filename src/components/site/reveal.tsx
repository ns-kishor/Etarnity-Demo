"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Shared editorial easing — import this instead of redefining it. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface RevealProps {
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Fade-up (16px) scroll reveal. Plays once when the element enters the
 * viewport (-80px margin). Renders a plain element with no animation when
 * the user prefers reduced motion.
 */
export function Reveal({
  delay = 0,
  as = "div",
  className,
  children,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    // Cast to a concrete intrinsic tag: a union of all intrinsic element
    // names would collapse `children` to `never` in JSX type checking.
    const Tag = as as "div";
    return (
      <Tag className={className}>
        {children}
      </Tag>
    );
  }

  const MotionTag = (motion as unknown as Record<string, React.ElementType>)[
    as
  ] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

export default Reveal;
