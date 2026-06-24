export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { articleService, settingService } from '@/services';
import { ArticleSummary } from '@/types';
// import { articles } from '@/lib/data'; // Removed static import
import FadeUp from '@/components/shared/FadeUp';
import { Calendar, ChevronRight, Newspaper, Users, Globe, Headset, Phone, Mail } from 'lucide-react';
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
  const publishedArticles = articles.filter((a: ArticleSummary) => !a.isDraft);
  const newsInternal = publishedArticles.filter((a: ArticleSummary) => a.category === 'tin-noi-bo');
  const newsIndustry = publishedArticles.filter((a: ArticleSummary) => a.category === 'tin-nganh');
  const allNews = localizeAll(
    [...newsInternal, ...newsIndustry].sort((a: ArticleSummary, b: ArticleSummary) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()),
    locale,
  );

  return (
    <div className="bg-white min-h-screen pb-20">
      <PageHero
        locale={locale}
        eyebrow={locale === 'en' ? 'Newsroom' : 'Bản tin'}
        title={locale === 'en' ? 'Binovet News' : 'Tin Tức binovet'}
        subtitle={locale === 'en' ? 'The latest news on binovet activities, veterinary industry events and digital transformation trends in modern animal husbandry.' : 'Cập nhật tin tức mới nhất về các hoạt động của binovet, sự kiện ngành thú y và xu hướng chuyển đổi số trong chăn nuôi hiện đại.'}
        breadcrumb={[{ label: locale === 'en' ? 'News' : 'Tin tức' }]}
      />

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8 lg:space-y-10">
             {allNews.map((a: ArticleSummary, index: number) => (
               <FadeUp key={a.id} delay={index * 0.1}>
               <article className="card-elegant group flex flex-col md:flex-row gap-8 p-6">
                  <Link href={localePath(locale, `/bai-viet/${a.slug}`)} className="w-full md:w-2/5 aspect-[16/10] relative overflow-hidden rounded-2xl shrink-0">
                     <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur text-ink text-[0.66rem] font-montserrat font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                           {a.category === 'tin-noi-bo'
                             ? (locale === 'en' ? 'Internal' : 'Nội bộ')
                             : (locale === 'en' ? 'Industry' : 'Ngành chăn nuôi')}
                        </span>
                     </div>
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
               </FadeUp>
             ))}
          </div>

          {/* Side Panels */}
          <aside className="lg:col-span-1 space-y-8 lg:sticky lg:top-28 lg:self-start">
             {/* Category Stats */}
             <div className="box-footer relative overflow-hidden p-8 rounded-2xl text-white">
                <div className="bg-molecule absolute inset-0 opacity-50 pointer-events-none" />
                <div className="relative z-10">
                <h3 className="font-display font-semibold text-lg mb-6 border-b border-white/10 pb-4 text-white">{locale === 'en' ? 'Categories' : 'Chuyên mục'}</h3>
                <div className="space-y-2">
                   <Link href={localePath(locale, '/tin-tuc-noi-bo')} className="flex items-center justify-between gap-3 group rounded-xl px-3 py-2.5 -mx-3 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3.5">
                         <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition-all"><Users size={18} /></span>
                         <span className="font-medium text-sm">{locale === 'en' ? 'Internal news' : 'Tin nội bộ'}</span>
                      </div>
                      <span className="text-xs text-white/50 font-montserrat font-semibold">{newsInternal.length}</span>
                   </Link>
                   <Link href={localePath(locale, '/tin-tuc-nganh-chan-nuoi-thu-y')} className="flex items-center justify-between gap-3 group rounded-xl px-3 py-2.5 -mx-3 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3.5">
                         <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition-all"><Globe size={18} /></span>
                         <span className="font-medium text-sm">{locale === 'en' ? 'Industry news' : 'Tin ngành'}</span>
                      </div>
                      <span className="text-xs text-white/50 font-montserrat font-semibold">{newsIndustry.length}</span>
                   </Link>
                   <Link href={localePath(locale, '/benh-va-dieu-tri-benh')} className="flex items-center justify-between gap-3 group rounded-xl px-3 py-2.5 -mx-3 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3.5">
                         <span className="w-10 h-10 bg-secondary/20 text-secondary rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all"><Newspaper size={18} /></span>
                         <span className="font-medium text-sm">{locale === 'en' ? 'Diseases & Treatment' : 'Bệnh & Điều trị'}</span>
                      </div>
                      <span className="text-xs text-white/50 font-montserrat font-semibold">{publishedArticles.filter((a: ArticleSummary) => a.category === 'benh-dieu-tri').length}</span>
                   </Link>
                </div>
                </div>
             </div>

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
          </aside>
        </div>
      </div>
    </div>
  );
}
