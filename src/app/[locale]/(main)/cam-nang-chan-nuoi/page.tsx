import React from 'react';
import Link from 'next/link';
import { articleService, animalTagService } from '@/services';
import { ArticleSummary, AnimalTag } from '@/types';
// import { articles, animalTags } from '@/lib/data'; // Removed static imports
import { Calendar, ChevronRight, Search, PawPrint, Bird, Beef, Fish, Rabbit, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import { Metadata } from 'next';
import { resolveLocale, localePath } from '@/lib/i18n/config';
import { localizeAll } from '@/lib/i18n/localize';

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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Farming Handbook - Knowledge & Techniques - binovet' : 'Cẩm Nang Chăn Nuôi - Kiến Thức & Kỹ Thuật - binovet',
    description: isEn
      ? 'Sharing effective farming knowledge, techniques and experience from leading experts. Detailed guides for livestock and poultry.'
      : 'Chia sẻ kiến thức, kỹ thuật và kinh nghiệm chăn nuôi hiệu quả từ các chuyên gia hàng đầu. Hướng dẫn chi tiết cho gia súc, gia cầm.',
    keywords: ['cẩm nang chăn nuôi', 'kỹ thuật chăn nuôi', 'kiến thức gia súc', 'gia cầm', 'binovet', 'hướng dẫn nuôi cấp'],
    robots: 'index, follow',
    openGraph: {
      title: isEn ? 'Farming Handbook - binovet' : 'Cẩm Nang Chăn Nuôi - binovet',
      description: isEn
        ? 'Sharing effective farming knowledge, techniques and experience from leading experts.'
        : 'Chia sẻ kiến thức, kỹ thuật và kinh nghiệm chăn nuôi hiệu quả từ các chuyên gia hàng đầu.',
      url: `https://binovet.com.vn${localePath(locale, '/cam-nang-chan-nuoi')}`,
      images: [
        {
          url: '/images/about.svg',
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function HandbookPage({ params }: { params: Promise<{ locale: string }> }) {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const articles = await articleService.getAllSummary();
  const animalTagsRaw = await animalTagService.getAll();
  const animalTags = localizeAll(animalTagsRaw, locale);
  const allHandbook = Array.isArray(articles) ? localizeAll(articles.filter((a: ArticleSummary) => a.category === 'cam-nang' && !a.isDraft), locale) : [];
  const tagSlugs = new Set(animalTags.map((t: AnimalTag) => t.slug));
  const otherHandbook = allHandbook.filter((a: ArticleSummary) => !a.animalTag || !tagSlugs.has(a.animalTag));

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        locale={locale}
        align="left"
        eyebrow={locale === 'en' ? 'Knowledge & techniques' : 'Kiến thức & kỹ thuật'}
        title={locale === 'en' ? 'Farming Handbook' : 'Cẩm Nang Chăn Nuôi'}
        subtitle={locale === 'en' ? 'Sharing effective farming knowledge, techniques and experience from leading experts.' : 'Chia sẻ kiến thức, kỹ thuật và kinh nghiệm chăn nuôi hiệu quả từ các chuyên gia hàng đầu.'}
        breadcrumb={[{ label: locale === 'en' ? 'Farming handbook' : 'Cẩm nang chăn nuôi' }]}
      >
        <div className="relative w-full md:w-80 mt-8">
           <input type="text" placeholder={locale === 'en' ? 'Search articles...' : 'Tìm kiếm bài viết...'} className="w-full bg-white/10 border border-white/20 rounded-full py-3 px-6 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-secondary transition-all pr-12" />
           <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
        </div>
      </PageHero>

      <div className="container mx-auto px-4 py-16 lg:py-24">
        {/* Grouped by Animal - Each tag gets its own section */}
        {animalTags.map((tag: AnimalTag) => {
          const tagArticles = allHandbook.filter((a: ArticleSummary) => a.animalTag === tag.slug);
          if (tagArticles.length === 0) return null;
          const TagIcon = getTagIcon(tag.slug);

          return (
            <section key={tag.id} className="mb-16 lg:mb-20">
              {/* Section Header */}
              <div className="flex items-center justify-between gap-4 mb-8 pb-5 border-b border-line">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-xl bg-primary/8 text-primary flex items-center justify-center shrink-0">
                    <TagIcon size={24} />
                  </span>
                  <div>
                    <h2 className="font-display font-semibold text-2xl text-ink">{tag.name}</h2>
                    <p className="text-sm text-ink-soft">{tag.description}</p>
                  </div>
                </div>
                <Link
                  href={localePath(locale, `/cam-nang-chan-nuoi/${tag.slug}`)}
                  className="link-underline hidden md:inline-flex items-center gap-2 text-primary font-montserrat font-semibold text-xs uppercase tracking-[0.16em]"
                >
                  {locale === 'en' ? 'View all' : 'Xem tất cả'} <ChevronRight size={16} />
                </Link>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {tagArticles.slice(0, 3).map((a: ArticleSummary) => (
                  <article key={a.id} className="card-elegant group flex flex-col h-full overflow-hidden">
                    <Link href={localePath(locale, `/bai-viet/${a.slug}`)} className="aspect-[16/10] relative overflow-hidden block">
                      <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-ink text-[0.66rem] font-montserrat font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                        {a.category === 'cam-nang'
                          ? (locale === 'en' ? 'Techniques' : 'Kỹ thuật')
                          : (locale === 'en' ? 'Diseases & Treatment' : 'Bệnh & Điều trị')}
                      </span>
                    </Link>
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-ink-soft text-[0.7rem] font-montserrat font-semibold mb-4 uppercase tracking-[0.16em]">
                        <Calendar size={14} className="text-secondary" /> {a.publishDate}
                      </div>
                      <h3 className="text-xl font-semibold text-ink mb-4 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-ink-soft text-sm line-clamp-3 mb-6 flex-1">
                        {a.excerpt}
                      </p>
                      <Link href={localePath(locale, `/bai-viet/${a.slug}`)} className="link-underline inline-flex items-center gap-2 text-primary font-montserrat font-semibold text-xs uppercase tracking-[0.16em] self-start">
                        {locale === 'en' ? 'View details' : 'Xem chi tiết'} <ChevronRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Mobile "Xem tất cả" */}
              <div className="mt-8 md:hidden text-center">
                <Link
                  href={localePath(locale, `/cam-nang-chan-nuoi/${tag.slug}`)}
                  className="btn btn-outline"
                >
                  {locale === 'en' ? 'View all' : 'Xem tất cả'} {tag.name} <ChevronRight size={16} />
                </Link>
              </div>
            </section>
          );
        })}

        {/* Uncategorized Articles - "Khác" */}
        {otherHandbook.length > 0 && (
          <section className="mb-16 lg:mb-20">
            {/* Section Header */}
            <div className="flex items-center justify-between gap-4 mb-8 pb-5 border-b border-line">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-primary/8 text-primary flex items-center justify-center shrink-0">
                  <Leaf size={24} />
                </span>
                <div>
                  <h2 className="font-display font-semibold text-2xl text-ink">{locale === 'en' ? 'Other' : 'Khác'}</h2>
                  <p className="text-sm text-ink-soft">{locale === 'en' ? 'Articles not yet categorized by animal species' : 'Các bài viết chưa phân loại theo loài vật'}</p>
                </div>
              </div>
              <Link
                href={localePath(locale, '/cam-nang-chan-nuoi/khac')}
                className="link-underline hidden md:inline-flex items-center gap-2 text-primary font-montserrat font-semibold text-xs uppercase tracking-[0.16em]"
              >
                {locale === 'en' ? 'View all' : 'Xem tất cả'} <ChevronRight size={16} />
              </Link>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {otherHandbook.slice(0, 3).map((a: ArticleSummary) => (
                <article key={a.id} className="card-elegant group flex flex-col h-full overflow-hidden">
                  <Link href={localePath(locale, `/bai-viet/${a.slug}`)} className="aspect-[16/10] relative overflow-hidden block">
                    <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-ink text-[0.66rem] font-montserrat font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                      {a.category === 'cam-nang'
                        ? (locale === 'en' ? 'Techniques' : 'Kỹ thuật')
                        : (locale === 'en' ? 'Diseases & Treatment' : 'Bệnh & Điều trị')}
                    </span>
                  </Link>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-ink-soft text-[0.7rem] font-montserrat font-semibold mb-4 uppercase tracking-[0.16em]">
                      <Calendar size={14} className="text-secondary" /> {a.publishDate}
                    </div>
                    <h3 className="text-xl font-semibold text-ink mb-4 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-ink-soft text-sm line-clamp-3 mb-6 flex-1">
                      {a.excerpt}
                    </p>
                    <Link href={localePath(locale, `/bai-viet/${a.slug}`)} className="link-underline inline-flex items-center gap-2 text-primary font-montserrat font-semibold text-xs uppercase tracking-[0.16em] self-start">
                      {locale === 'en' ? 'View details' : 'Xem chi tiết'} <ChevronRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Mobile "Xem tất cả" */}
            <div className="mt-8 md:hidden text-center">
              <Link
                href={localePath(locale, '/cam-nang-chan-nuoi/khac')}
                className="btn btn-outline"
              >
                {locale === 'en' ? 'View all Other' : 'Xem tất cả Khác'} <ChevronRight size={16} />
              </Link>
            </div>
          </section>
        )}

        {/* Empty State */}
        {allHandbook.length === 0 && (
          <div className="text-center py-20 bg-sand rounded-2xl border border-line">
             <span className="w-14 h-14 rounded-xl bg-primary/8 text-primary flex items-center justify-center mx-auto mb-5"><PawPrint size={26} /></span>
             <div className="text-ink font-montserrat font-semibold mb-3 uppercase tracking-[0.16em]">{locale === 'en' ? 'No articles yet' : 'Chưa có bài viết nào'}</div>
             <p className="text-ink-soft max-w-xs mx-auto">{locale === 'en' ? 'We are updating more new knowledge. Please check back later.' : 'Chúng tôi đang cập nhật thêm kiến thức mới. Vui lòng quay lại sau.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
