"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { locale } = useLocale();

  const [query, setQuery] = useState(searchParams.get('search') || '');

  // Update local state when URL params change (e.g. browser back/forward)
  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams(query);
  };

  const updateSearchParams = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    // Reset to page 1 when search changes
    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery('');
    updateSearchParams('');
  };

  return (
    <form onSubmit={handleSearch} className="relative group">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={locale === 'en' ? 'Search products...' : 'Tìm kiếm sản phẩm...'}
        className="w-full bg-white border border-line rounded-full py-3.5 pl-12 pr-12 text-sm font-medium text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all"
      />
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/60 group-focus-within:text-primary transition-colors">
        <Search size={18} />
      </span>
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-paper hover:bg-secondary/10 text-ink-soft hover:text-secondary flex items-center justify-center transition-colors"
          title={locale === 'en' ? 'Clear search' : 'Xóa tìm kiếm'}
          aria-label={locale === 'en' ? 'Clear search' : 'Xóa tìm kiếm'}
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}
