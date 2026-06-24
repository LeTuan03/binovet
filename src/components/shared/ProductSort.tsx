"use client";

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { locale } = useLocale();

  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== 'newest') {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }

    // Sorting should reset to page 1 for a consistent view.
    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <span className="text-[0.68rem] text-ink-soft font-semibold uppercase tracking-[0.16em] font-montserrat whitespace-nowrap">
        {locale === 'en' ? 'Sort' : 'Sắp xếp'}
      </span>
      <div className="relative">
        <select
          value={currentSort}
          onChange={handleSortChange}
          className="appearance-none border border-line bg-white text-ink rounded-full pl-4 pr-10 py-2.5 text-sm font-medium cursor-pointer focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 hover:border-primary/30 transition-all"
        >
          <option value="newest">{locale === 'en' ? 'Newest' : 'Sản phẩm mới nhất'}</option>
          <option value="name-asc">{locale === 'en' ? 'Name A-Z' : 'Tên A-Z'}</option>
          <option value="name-desc">{locale === 'en' ? 'Name Z-A' : 'Tên Z-A'}</option>
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
        />
      </div>
    </div>
  );
}
