"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n/LocaleProvider';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  queryParam?: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl, queryParam = 'page' }: PaginationProps) {
  const { locale } = useLocale();
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return page === 1 ? baseUrl : `${baseUrl}${separator}${queryParam}=${page}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  const navBtn =
    'w-11 h-11 rounded-full flex items-center justify-center text-ink-soft border border-line bg-white hover:border-primary hover:text-primary transition-all';

  return (
    <nav className="flex items-center justify-center gap-2" aria-label={locale === 'en' ? 'Pagination' : 'Phân trang'}>
      {/* First page */}
      {currentPage > 2 && (
        <Link
          href={getPageUrl(1)}
          className={navBtn}
          title={locale === 'en' ? 'First page' : 'Trang đầu'}
          aria-label={locale === 'en' ? 'First page' : 'Trang đầu'}
        >
          <ChevronsLeft size={16} />
        </Link>
      )}

      {/* Previous */}
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className={navBtn}
          title={locale === 'en' ? 'Previous page' : 'Trang trước'}
          aria-label={locale === 'en' ? 'Previous page' : 'Trang trước'}
        >
          <ChevronLeft size={16} />
        </Link>
      )}

      {/* Page numbers */}
      {pages.map((page, i) => {
        if (page === '...') {
          return (
            <span key={`dots-${i}`} className="w-11 h-11 flex items-center justify-center text-ink-soft/50 select-none">
              …
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <Link
            key={pageNum}
            href={getPageUrl(pageNum)}
            aria-current={isActive ? 'page' : undefined}
            className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
              isActive
                ? 'bg-primary text-white shadow-elegant'
                : 'text-ink-soft bg-white border border-line hover:border-primary hover:text-primary'
            }`}
          >
            {pageNum}
          </Link>
        );
      })}

      {/* Next */}
      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className={navBtn}
          title={locale === 'en' ? 'Next page' : 'Trang sau'}
          aria-label={locale === 'en' ? 'Next page' : 'Trang sau'}
        >
          <ChevronRight size={16} />
        </Link>
      )}

      {/* Last page */}
      {currentPage < totalPages - 1 && (
        <Link
          href={getPageUrl(totalPages)}
          className={navBtn}
          title={locale === 'en' ? 'Last page' : 'Trang cuối'}
          aria-label={locale === 'en' ? 'Last page' : 'Trang cuối'}
        >
          <ChevronsRight size={16} />
        </Link>
      )}
    </nav>
  );
}
