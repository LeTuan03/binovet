import React from 'react';
import Link from 'next/link';
import { articleService } from '@/services';
import { ArticleSummary } from '@/types';
// import { articles } from '@/lib/data'; // Removed static import
import { Calendar, Users } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import { resolveLocale, localePath } from '@/lib/i18n/config';
import { localizeAll } from '@/lib/i18n/localize';

export default async function InternalNewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const articles = await articleService.getAllSummary();
  const list = Array.isArray(articles) ? localizeAll(articles.filter((a: ArticleSummary) => a.category === 'tin-noi-bo' && !a.isDraft), locale) : [];

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        locale={locale}
        align="left"
        eyebrow={locale === 'en' ? 'Newsroom' : 'Bản tin'}
        title={locale === 'en' ? 'Internal news' : 'Tin tức nội bộ'}
        subtitle={locale === 'en' ? 'Activities, events and corporate culture at binovet.' : 'Hoạt động, sự kiện và văn hóa doanh nghiệp tại binovet.'}
        breadcrumb={[
          { label: locale === 'en' ? 'News' : 'Tin tức', href: '/tin-tuc' },
          { label: locale === 'en' ? 'Internal news' : 'Tin tức nội bộ' },
        ]}
      />

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="flex flex-col mx-auto divide-y divide-dashed divide-line">
          {list.map((a: ArticleSummary) => (
            <article key={a.id} className="group flex flex-col sm:flex-row items-start gap-6 lg:gap-8 py-8">
               <Link href={localePath(locale, `/bai-viet/${a.slug}`)} className="block shrink-0 w-full sm:w-48 lg:w-52 overflow-hidden rounded-lg">
                  <img src={a.thumbnail} alt={a.title} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700" />
               </Link>
               <div className="flex flex-col flex-1">
                  <h2 className="text-xl lg:text-2xl font-semibold text-ink mb-3 leading-snug group-hover:text-primary transition-colors">
                     <Link href={localePath(locale, `/bai-viet/${a.slug}`)}>{a.title}</Link>
                  </h2>
                  <p className="text-ink-soft text-sm mb-3 line-clamp-2">
                     {a.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-ink-soft text-[0.7rem] font-montserrat font-semibold mb-5 uppercase tracking-[0.16em]">
                     <Calendar size={14} className="text-secondary" /> {a.publishDate}
                  </div>
                  <Link href={localePath(locale, `/bai-viet/${a.slug}`)} className="inline-flex items-center self-start bg-sand hover:bg-line text-ink font-montserrat font-semibold text-[0.7rem] uppercase tracking-[0.14em] px-5 py-2.5 rounded-md transition-colors">
                     {locale === 'en' ? 'Read more' : 'Đọc thêm'}
                  </Link>
               </div>
            </article>
          ))}
        </div>
        {list.length === 0 && (
          <div className="text-center py-20 bg-sand rounded-2xl border border-line">
             <span className="w-14 h-14 rounded-xl bg-primary/8 text-primary flex items-center justify-center mx-auto mb-5"><Users size={26} /></span>
             <p className="text-ink-soft font-montserrat font-semibold uppercase tracking-[0.16em]">{locale === 'en' ? 'Updating new events...' : 'Đang cập nhật sự kiện mới...'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
