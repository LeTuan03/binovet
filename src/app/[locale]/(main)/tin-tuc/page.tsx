export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { articleService, settingService } from '@/services';
import { ArticleSummary } from '@/types';
// import { articles } from '@/lib/data'; // Removed static import
import Reveal from '@/components/shared/Reveal';
import { Calendar, ChevronRight, Headset, Phone, Mail } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import { Metadata } from 'next';
import { resolveLocale, localePath } from '@/lib/i18n/config';
import { localizeAll } from '@/lib/i18n/localize';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const isEn = locale === 'en';
  return {
    title: isEn ? 'News & Articles - binovet' : 'Tin Tức & Bài Viết - binovet',
    description: isEn
      ? 'The latest news on binovet activities, veterinary industry events and digital transformation trends in modern animal husbandry.'
      : 'Cập nhật tin tức mới nhất về các hoạt động của binovet, sự kiện ngành thú y và xu hướng chuyển đổi số trong chăn nuôi hiện đại.',
    keywords: ['tin tức binovet', 'bài viết thú y', 'chăn nuôi', 'sự kiện ngành', 'kiến thức thú y'],
    robots: 'index, follow',
    openGraph: {
      title: isEn ? 'News & Articles - binovet' : 'Tin Tức & Bài Viết - binovet',
      description: isEn
        ? 'The latest news on binovet activities and veterinary industry events.'
        : 'Cập nhật tin tức mới nhất về các hoạt động của binovet và sự kiện ngành thú y.',
      url: `https://binovet.com.vn${localePath(locale, '/tin-tuc')}`,
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

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const articles = await articleService.getAllSummary();
  const settings = (await settingService.get()) as any;
  // Single flat news feed — no internal / industry split.
  const allNews = localizeAll(
    articles
      .filter((a: ArticleSummary) => !a.isDraft && (a.category === 'tin-noi-bo' || a.category === 'tin-nganh'))
      .sort((a: ArticleSummary, b: ArticleSummary) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()),
    locale,
  );

  return (
    <div className="bg-white min-h-screen pb-20">
      <PageHero
        locale={locale}
        eyebrow={locale === 'en' ? 'Newsroom' : 'Bản tin'}
        title={locale === 'en' ? 'Binovet News' : 'Tin Tức Binovet'}
        subtitle={locale === 'en' ? 'The latest news on Binovet activities, veterinary industry events and digital transformation trends in modern animal husbandry.' : 'Cập nhật tin tức mới nhất về các hoạt động của binovet, sự kiện ngành thú y và xu hướng chuyển đổi số trong chăn nuôi hiện đại.'}
        breadcrumb={[{ label: locale === 'en' ? 'News' : 'Tin tức' }]}
      />

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8 lg:space-y-10">
             {allNews.map((a: ArticleSummary, index: number) => (
               <Reveal key={a.id} direction="left" distance={56} delay={index * 0.1}>
               <article className="card-elegant group flex flex-col md:flex-row gap-8 p-6">
                  <Link href={localePath(locale, `/bai-viet/${a.slug}`)} className="w-full md:w-2/5 aspect-[16/10] relative overflow-hidden rounded-2xl shrink-0">
                     <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </Link>
                  <div className="flex flex-col justify-center py-2 flex-1">
                     <div className="flex items-center gap-2 text-ink-soft text-[0.7rem] font-montserrat font-semibold mb-4 uppercase tracking-[0.16em]">
                        <Calendar size={14} className="text-secondary" /> {a.publishDate}
                     </div>
                     <h2 className="text-2xl font-semibold text-ink mb-4 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {a.title}
                     </h2>
                     <p className="text-ink-soft text-sm line-clamp-2 mb-6">
                        {a.excerpt}
                     </p>
                     <Link href={localePath(locale, `/bai-viet/${a.slug}`)} className="link-underline inline-flex items-center gap-2 text-primary font-montserrat font-semibold text-xs uppercase tracking-[0.16em] self-start">
                        {locale === 'en' ? 'Read more' : 'Đọc tiếp'} <ChevronRight size={16} />
                     </Link>
                  </div>
               </article>
               </Reveal>
             ))}
          </div>

          {/* Side Panels */}
          <Reveal direction="right" distance={56} className="lg:col-span-1 space-y-8 lg:sticky lg:top-28 lg:self-start">
             {/* Media support */}
             <div className="card-elegant p-7">
                <div className="flex items-center gap-3 mb-5">
                   <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      <Headset size={20} />
                   </div>
                   <h3 className="font-display font-semibold text-lg text-ink leading-tight">{locale === 'en' ? 'Media support' : 'Hỗ trợ truyền thông'}</h3>
                </div>
                <p className="text-sm text-ink-soft mb-6 leading-relaxed">{locale === 'en' ? 'We always listen and are ready to share information about the animal husbandry industry as well as binovet\'s international cooperation activities.' : 'Chúng tôi luôn lắng nghe và sẵn sàng chia sẻ thông tin về ngành chăn nuôi cũng như các hoạt động hợp tác quốc tế của binovet.'}</p>
                <div className="space-y-3">
                   <div className="p-4 bg-cream rounded-xl flex items-center gap-3 border border-line">
                      <Phone size={16} className="text-secondary shrink-0" />
                      <div>
                         <div className="text-secondary font-montserrat font-semibold uppercase text-[0.6rem] tracking-[0.16em]">Hotline</div>
                         <div className="text-ink font-semibold text-sm">{settings?.hotline1}</div>
                      </div>
                   </div>
                   <div className="p-4 bg-cream rounded-xl flex items-center gap-3 border border-line">
                      <Mail size={16} className="text-secondary shrink-0" />
                      <div>
                         <div className="text-secondary font-montserrat font-semibold uppercase text-[0.6rem] tracking-[0.16em]">Email</div>
                         <div className="text-ink font-semibold text-xs break-all">{settings?.support?.doctorEmail}</div>
                      </div>
                   </div>
                </div>
             </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
