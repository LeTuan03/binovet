import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articleService, animalTagService } from '@/services';
import { ArticleSummary, AnimalTag } from '@/types';
// import { articles, animalTags } from '@/lib/data'; // Removed static imports
import { Calendar, PawPrint, Bird, Beef, Fish, Rabbit, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import { resolveLocale, localePath } from '@/lib/i18n/config';
import { localize, localizeAll } from '@/lib/i18n/localize';

// Map animal-tag slugs to refined lucide icons (replaces raw emoji)
const TAG_ICONS: Record<string, LucideIcon> = {
  heo: PawPrint,
  'gia-cam': Bird,
  'trau-bo': Beef,
  ca: Fish,
  'thuy-san': Fish,
  'tho': Rabbit,
  'thu-cung': PawPrint,
  khac: Leaf,
};

function getTagIcon(slug: string): LucideIcon {
  return TAG_ICONS[slug] ?? PawPrint;
}

export default async function AnimalTagPage({ params }: Readonly<{ params: Promise<{ locale: string; tag: string }> }>) {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const tag = p.tag;
  const articles = await articleService.getAllSummary();
  const isOther = tag === 'khac';

  let animalTag: AnimalTag | null;
  let tagArticles: ArticleSummary[];

  if (isOther) {
    const animalTags = await animalTagService.getAll();
    const tagSlugs = new Set(animalTags.map((t: AnimalTag) => t.slug));
    animalTag = {
      id: BigInt(0),
      name: locale === 'en' ? 'Other' : 'Khác',
      slug: 'khac',
      icon: '',
      description: locale === 'en' ? 'Other articles' : 'Các bài viết khác',
    };
    tagArticles = localizeAll(articles.filter((a: ArticleSummary) => a.category === 'cam-nang' && !a.isDraft && (!a.animalTag || !tagSlugs.has(a.animalTag))), locale);
  } else {
    const rawTag = await animalTagService.getBySlug(tag);
    if (!rawTag) {
      notFound();
    }
    animalTag = localize(rawTag, locale);
    tagArticles = localizeAll(articles.filter((a: ArticleSummary) => a.animalTag === tag && a.category === 'cam-nang' && !a.isDraft), locale);
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <PageHero
        locale={locale}
        align="left"
        eyebrow={locale === 'en' ? 'Farming handbook' : 'Cẩm nang chăn nuôi'}
        title={animalTag.name}
        subtitle={animalTag.description}
        breadcrumb={[
          { label: locale === 'en' ? 'Farming handbook' : 'Cẩm nang chăn nuôi', href: '/cam-nang-chan-nuoi' },
          { label: animalTag.name },
        ]}
      />

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="flex flex-col mx-auto divide-y divide-dashed divide-line">
          {tagArticles.map((a: ArticleSummary) => (
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
                  {locale === 'en' ? 'Read more' : 'Xem thêm'}
                </Link>
              </div>
            </article>
          ))}
        </div>

        {tagArticles.length === 0 && (
          <div className="text-center py-20 bg-sand rounded-2xl border border-line">
            <span className="w-14 h-14 rounded-xl bg-primary/8 text-primary flex items-center justify-center mx-auto mb-5">
              {(() => { const EmptyIcon = getTagIcon(animalTag.slug); return <EmptyIcon size={26} />; })()}
            </span>
            <div className="text-ink font-montserrat font-semibold mb-2 uppercase tracking-[0.16em]">{locale === 'en' ? `No articles about ${animalTag.name} yet` : `Chưa có bài viết nào về ${animalTag.name}`}</div>
            <p className="text-ink-soft max-w-xs mx-auto text-sm">{locale === 'en' ? 'We are updating new articles. Please check back later.' : 'Chúng tôi đang cập nhật bài viết mới. Vui lòng quay lại sau.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
