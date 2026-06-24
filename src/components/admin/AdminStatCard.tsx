"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AdminStatCardProps {
  label: string;
  value: React.ReactNode;
  /** colour of the big metric value (and the icon tile glyph) */
  valueColor?: string;
  /** soft tint behind the corner icon */
  tileBg?: string;
  icon?: React.ReactNode;
  /** stagger index for the entrance animation */
  index?: number;
}

/**
 * Compact metric card used at the top of admin list pages
 * (label on top, large coloured value below, soft icon tile on the right).
 */
export default function AdminStatCard({
  label,
  value,
  valueColor = '#0c2236',
  tileBg = '#eaf1f9',
  icon,
  index = 0,
}: AdminStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-[#eef1f5] px-5 py-4 flex items-center justify-between gap-3 shadow-[0_1px_2px_rgba(12,34,54,0.04),0_8px_24px_rgba(12,34,54,0.05)] hover:shadow-[0_4px_8px_rgba(12,34,54,0.06),0_12px_32px_rgba(12,34,54,0.08)] transition-all"
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8] truncate">
          {label}
        </span>
        <span
          className="text-3xl font-semibold tracking-tight leading-none"
          style={{ color: valueColor }}
        >
          {value}
        </span>
      </div>
      {icon && (
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: tileBg, color: valueColor }}
        >
          {icon}
        </div>
      )}
    </motion.div>
  );
}
