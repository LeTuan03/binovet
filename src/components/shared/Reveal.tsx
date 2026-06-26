"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  /**
   * Where the element travels FROM as it reveals:
   * `up` rises from below, `down` drops in from above (trượt xuống),
   * `left`/`right` slide in from that side (trượt sang).
   */
  direction?: Direction;
  delay?: number;
  duration?: number;
  /** Travel distance in px before settling into place. */
  distance?: number;
  className?: string;
  /** How much of the element must be visible before it animates. */
  amount?: "some" | "all" | number;
  /** Replay every time it scrolls into view (default: once). */
  replay?: boolean;
}

const offsetFor = (direction: Direction, distance: number) => {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: -distance };
    case "right":
      return { x: distance };
    default:
      return {};
  }
};

/**
 * Directional scroll reveal — a superset of {@link FadeUp} that can also
 * slide sideways (`left`/`right`) or drop down (`down`). It wraps its
 * server-rendered children untouched.
 *
 * NOTE: we intentionally do NOT branch the rendered element on
 * `useReducedMotion()` — doing so makes the server render a `motion.div`
 * (opacity:0) while the client renders a plain div, which is a hydration
 * mismatch that can leave the content stuck invisible. Framer Motion's
 * default `reducedMotion: "never"` keeps the animation playing; ambient CSS
 * loops are calmed for reduced-motion users in globals.css instead.
 */
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance = 40,
  className = "",
  amount = "some",
  replay = false,
}: RevealProps) {
  if (direction === "none") {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...offsetFor(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: !replay, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
