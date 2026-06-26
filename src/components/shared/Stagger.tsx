"use client";

import { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

type Direction = "up" | "down" | "left" | "right";

interface GroupProps {
  children: ReactNode;
  className?: string;
  /** Gap between each child's reveal, in seconds. */
  stagger?: number;
  /** Delay before the first child reveals, in seconds. */
  delayChildren?: number;
  amount?: "some" | "all" | number;
  replay?: boolean;
}

interface ItemProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
  duration?: number;
}

const offsetFor = (direction: Direction, distance: number) => {
  switch (direction) {
    case "down":
      return { y: -distance };
    case "left":
      return { x: -distance };
    case "right":
      return { x: distance };
    default:
      return { y: distance };
  }
};

/**
 * Cascading reveal for grids and lists: children wrapped in {@link StaggerItem}
 * slide/fade in one after another as the group scrolls into view.
 *
 * As with {@link Reveal}, the rendered element is NOT branched on
 * `useReducedMotion()` to avoid an SSR/client hydration mismatch that can
 * leave content stuck invisible; ambient CSS loops are calmed in globals.css.
 */
export function StaggerGroup({
  children,
  className = "",
  stagger = 0.09,
  delayChildren = 0,
  amount = "some",
  replay = false,
}: GroupProps) {
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: !replay, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
  direction = "up",
  distance = 40,
  duration = 0.6,
}: ItemProps) {
  const variants: Variants = {
    hidden: { opacity: 0, ...offsetFor(direction, distance) },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
