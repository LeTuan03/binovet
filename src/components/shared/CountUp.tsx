"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CountUpProps {
  /** Raw stat value, e.g. "20+", "1000+", "63" or "GMP-WHO". */
  readonly value: string;
  /** Animation length in milliseconds. */
  readonly duration?: number;
  readonly className?: string;
}

/**
 * Counts a numeric stat up from zero when it scrolls into view.
 * Values without a leading number (e.g. "GMP-WHO") render unchanged,
 * and any prefix/suffix around the number (e.g. the "+" in "1000+") is
 * preserved so the brand figures stay intact.
 */
export default function CountUp({ value, duration = 1800, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  const match = /\d[\d.,]*/.exec(value);
  const numeric = match ? Number(match[0].replace(/[.,]/g, "")) : null;
  const prefix = match ? value.slice(0, match.index) : "";
  const suffix = match ? value.slice(match.index + match[0].length) : "";

  const [display, setDisplay] = useState(numeric === null ? value : `${prefix}0${suffix}`);

  useEffect(() => {
    if (!inView || numeric === null) return;
    let raf = 0;
    let startTs = 0;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(eased * numeric);
      setDisplay(`${prefix}${current.toLocaleString()}${suffix}`);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, numeric, duration, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
