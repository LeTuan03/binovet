"use client";

import { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/**
 * Site-wide Framer Motion config.
 *
 * `reducedMotion="never"` makes Framer ignore the OS "reduce motion" setting.
 * This is deliberate: with the default, a device that has reduced-motion ON
 * makes Framer render different initial styles on the client than the server
 * produced (the server can't read the OS setting) — a hydration mismatch that
 * React "won't patch up", freezing every scroll-reveal at opacity:0 (blank
 * page). Forcing "never" keeps server and client identical AND lets the
 * brand's entrance animations play for everyone.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
