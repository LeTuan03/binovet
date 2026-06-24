import React from 'react';
import Link from 'next/link';
import { articleService } from '@/services';
import { ArticleSummary } from '@/types';
// import { articles } from '@/lib/data'; // Removed static import
import { ChevronRight, Stethoscope, Calendar } from 'lucide-react';
import Sidebar from '@/components/shared/Sidebar';
import PageHero from '@/components/shared/PageHero';
import { Metadata } from 'next';
import { resolveLocale, localePath } from '@/lib/i18n/config';
import { localizeAll } from '@/lib/i18n/localize';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Diseases & Treatment - binovet' : 'Bệnh & Điều Trị Bệnh - binovet',
    description: isEn
      ? 'Detailed information on common diseases in livestock and poultry and effective treatment methods from binovet veterinary experts.'
      : 'Thông tin chi tiết về các bệnh thường gặp ở gia súc, gia cầm và các phương pháp điều trị hiệu quả từ các chuyên gia thú y binovet.',
    keywords: ['bệnh thú y', 'điều trị bệnh', 'gia súc', 'gia cầm', 'phòng ngừa bệnh', 'kiến thức thú y'],
    robots: 'index, follow',
    openGraph: {
      title: isEn ? 'Diseases & Treatment - binovet' : 'Bệnh & Điều Trị Bệnh - binovet',
      description: isEn
        ? 'Detailed information on common diseases and effective treatment methods.'
        : 'Thông tin chi tiết về các bệnh thường gặp và phương pháp điều trị hiệu quả.',
      url: `https://binovet.com.vn${localePath(locale, '/benh-va-dieu-tri-benh')}`,
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

export default async function DiseasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const articles = await articleService.getAllSummary();
  const list = Array.isArray(articles) ? localizeAll(articles.filter((a: ArticleSummary) => a.category === 'benh-dieu-tri' && !a.isDraft), locale) : [];

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        locale={locale}
        align="left"
        eyebrow={locale === 'en' ? 'Disease alert' : 'Cảnh báo dịch bệnh'}
        title={locale === 'en' ? 'Diseases & Treatment' : 'Bệnh & Điều Trị'}
        subtitle={locale === 'en' ? 'A handbook for looking up symptoms, methodical diagnosis and treatment protocols to fully resolve common diseases in animals.' : 'Cẩm nang tra cứu triệu chứng, chẩn đoán bài bản và phác đồ điều trị dứt điểm các bệnh thường gặp trên vật nuôi.'}
        breadcrumb={[{ label: locale === 'en' ? 'Diseases & treatment' : 'Bệnh và điều trị bệnh' }]}
      />

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <main className="flex-1">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {list.map((a: ArticleSummary) => (
                <article key={a.id} className="card-elegant group flex flex-col sm:flex-row overflow-hidden">
                   <Link href={localePath(locale, `/bai-viet/${a.slug}`)} className="sm:w-2/5 shrink-0 aspect-[4/3] sm:aspect-auto relative overflow-hidden block">
                      <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-ink text-[0.66rem] font-montserrat font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                         {locale === 'en' ? 'Disease' : 'Bệnh'}
                      </span>
                   </Link>
                   <div className="p-6 lg:p-7 flex flex-col justify-center flex-1">
                      <div className="flex items-center gap-2 text-ink-soft text-[0.66rem] font-montserrat font-semibold mb-3 uppercase tracking-[0.16em]">
                         <Calendar size={13} className="text-secondary" /> {a.publishDate}
                      </div>
                      <h2 className="text-lg lg:text-xl font-semibold text-ink mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                         {a.title}
                      </h2>
                      <p className="text-ink-soft text-sm line-clamp-2 mb-5">
                         {a.excerpt}
                      </p>
                      <Link href={localePath(locale, `/bai-viet/${a.slug}`)} className="link-underline inline-flex items-center gap-2 text-primary font-montserrat font-semibold text-[0.72rem] uppercase tracking-[0.16em] self-start">
                         {locale === 'en' ? 'View treatment protocol' : 'Xem phác đồ điều trị'} <ChevronRight size={16} />
                      </Link>
                   </div>
                </article>
              ))}
            </div>

            {/* Support Banner */}
            <div className="mt-16 lg:mt-20 bg-cream rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 border border-line shadow-elegant">
               <div className="shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-primary/8 text-primary flex items-center justify-center">
                     <Stethoscope size={40} />
                  </div>
               </div>
               <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display font-semibold text-2xl text-ink mb-3">{locale === 'en' ? 'Need diagnostic support now?' : 'Cần hỗ trợ chẩn đoán ngay?'}</h3>
                  <p className="text-ink-soft max-w-2xl">{locale === 'en' ? "binovet's team of veterinarians is always ready to listen and advise you for free 24/7." : 'Đội ngũ Bác sĩ Thú y của binovet luôn sẵn sàng lắng nghe và tư vấn miễn phí cho bạn 24/7.'}</p>
               </div>
               <Link href={localePath(locale, '/lien-he')} className="btn btn-primary shrink-0">
                  {locale === 'en' ? 'Send support request' : 'Gửi yêu cầu hỗ trợ'}
               </Link>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <Sidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
