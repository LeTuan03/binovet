"use client";

import React, { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';

interface Spec {
  title: string;
  content: string;
}

interface ProductSpecificationsProps {
  specifications: Spec[];
}

export default function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  // First panel expanded by default for an inviting first glance.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {specifications.map((spec, index) => {
        const isOpen = openIndex === index;
        return (
          <section
            key={spec.title}
            className={`group bg-white border rounded-2xl overflow-hidden transition-[border-color,box-shadow] duration-500 ${
              isOpen
                ? 'border-primary/25 shadow-elegant'
                : 'border-line shadow-sm hover:border-primary/20'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-3.5 p-6 md:p-7 text-left cursor-pointer"
            >
              <span
                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                  isOpen ? 'bg-primary text-white' : 'bg-primary/8 text-primary'
                }`}
              >
                <FileText size={18} />
              </span>
              <h2 className="flex-1 font-display text-lg md:text-xl font-semibold text-ink">{spec.title}</h2>
              <span
                className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  isOpen
                    ? 'border-primary/30 bg-primary/8 text-primary rotate-180'
                    : 'border-line text-ink-soft group-hover:text-primary group-hover:border-primary/30'
                }`}
              >
                <ChevronDown size={18} />
              </span>
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 md:px-7 pb-6 md:pb-7">
                  <div className="pt-5 border-t border-line/80 leading-relaxed text-ink-soft whitespace-pre-wrap">
                    {spec.content}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
