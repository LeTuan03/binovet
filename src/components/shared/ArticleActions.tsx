"use client";

import React from 'react';
import { Share2, Printer } from 'lucide-react';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function ArticleActions() {
  const { locale } = useLocale();

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    window.print();
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="flex gap-2.5 no-print">
      <button
        onClick={handleCopy}
        title={locale === 'en' ? 'Copy link' : 'Sao chép liên kết'}
        aria-label={locale === 'en' ? 'Copy link' : 'Sao chép liên kết'}
        className="w-10 h-10 rounded-full border border-line bg-white flex items-center justify-center text-ink-soft hover:border-primary hover:bg-primary hover:text-white hover:-translate-y-0.5 hover:shadow-elegant transition-all duration-300 cursor-pointer"
      >
        <Share2 size={15} />
      </button>
      <button
        onClick={handlePrint}
        title={locale === 'en' ? 'Print article' : 'In bài viết'}
        aria-label={locale === 'en' ? 'Print article' : 'In bài viết'}
        className="w-10 h-10 rounded-full border border-line bg-white flex items-center justify-center text-ink-soft hover:border-ink hover:bg-ink hover:text-white hover:-translate-y-0.5 hover:shadow-elegant transition-all duration-300 cursor-pointer"
      >
        <Printer size={15} />
      </button>
    </div>
  );
}
