export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowRight, BadgeCheck, Headset, Award, Package, Building2, MapPin, Users } from 'lucide-react';
import { productService, articleService, bannerService, mediaService, settingService, categoryService } from '@/services';
import { ProductSummary, ArticleSummary, Category } from '@/types';
import BannerSlider from '@/components/home/BannerSlider';
import IntroVideo from '@/components/home/IntroVideo';
import FadeUp from '@/components/shared/FadeUp';
import CountUp from '@/components/shared/CountUp';
import SectionHeading from '@/components/shared/SectionHeading';
import { resolveLocale, localePath } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { localizeAll } from '@/lib/i18n/localize';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const en = locale === 'en';
  const dict = getDictionary(locale);
  const h = dict.home;

  const [productsRaw, articlesRaw, banners, mediaVideos, settings, categoriesRaw] = await Promise.all([
    productService.getAllSummary(),
    articleService.getAllSummary(),
    bannerService.getAll(),
    mediaService.getVideos(),
    settingService.get(),
    categoryService.getAll(),
  ]);

  const products = localizeAll(Array.isArray(productsRaw) ? productsRaw : [], locale) as ProductSummary[];
  const articles = localizeAll(Array.isArray(articlesRaw) ? articlesRaw : [], locale) as ArticleSummary[];
  const categories = localizeAll(Array.isArray(categoriesRaw) ? categoriesRaw : [], locale) as Category[];

  const activeBanners = Array.isArray(banners) ? banners.filter((b: any) => b.status).sort((a: any, b: any) => a.order - b.order).map(b => ({ ...b, id: Number(b.id) })) : [];

  // Latest news — featured news first, topped up with most recent non-draft news.
  const newsPool = articles.filter((a) => (a.category === 'tin-noi-bo' || a.category === 'tin-nganh') && !a.isDraft);
  const featuredNews = newsPool.filter((a) => a.featured);
  const latestNews = [...featuredNews, ...newsPool.filter((a) => !a.featured)].slice(0, 4);

  // Intro video — first active video (featured preferred).
  const videos = Array.isArray(mediaVideos) ? mediaVideos.filter((v: any) => v.status === 'active') : [];
  const introVideo = (videos.find((v: any) => v.featured) || videos[0]) as any;

  // Representative image for each category = first product in that category.
  const categoryImage = (cat: Category) => {
    const prod = products.find((p) => String(p.categoryId) === String(cat.id));
    return prod?.image || '/images/default-product.svg';
  };

  // Stats band — PLACEHOLDER figures, edit to real BINOVET numbers.
  const stats = [
    { icon: <Award size={26} />, value: '20+', label: en ? 'Years of experience' : 'Năm kinh nghiệm' },
    { icon: <Package size={26} />, value: `${Math.max(products.length, 100)}+`, label: en ? 'Products' : 'Sản phẩm' },
    { icon: <Building2 size={26} />, value: 'GMP-WHO', label: en ? 'Factory standard' : 'Tiêu chuẩn nhà máy' },
    { icon: <MapPin size={26} />, value: '63', label: en ? 'Provinces covered' : 'Tỉnh thành phủ sóng' },
    { icon: <Users size={26} />, value: '1000+', label: en ? 'Trusted customers' : 'Khách hàng tin dùng' },
  ];

  return (
    <div className="w-full bg-white">
      {/* 1. Hero Banner */}
      <BannerSlider banners={activeBanners} />

      {/* 2. Company Introduction + Video */}
      <section className="py-24 lg:py-28 bg-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <FadeUp>
            <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-center">
              {/* Intro video — left */}
              <div className="w-full lg:w-1/2">
                <IntroVideo
                  video={introVideo ? { url: introVideo.url, thumbnail: introVideo.thumbnail, title: introVideo.title } : null}
                  youtubeUrl={(settings as any)?.social?.youtube}
                  poster="/images/about.svg"
                  label={en ? 'Company film' : 'Phim giới thiệu'}
                />
              </div>

              {/* Heading, intro & feature cards — right */}
              <div className="w-full lg:w-1/2">
                <h2 className="flex items-center gap-4 font-display font-semibold leading-[1.1] tracking-tight text-4xl lg:text-5xl text-ink">
                  <span className="inline-block w-1.5 self-stretch min-h-[2.75rem] rounded-full bg-secondary shrink-0" aria-hidden="true" />
                  {h.about.eyebrow}
                </h2>

                <p className="text-ink-soft mt-7 leading-relaxed text-lg">{h.about.paragraph}</p>

                <div className="mt-9 space-y-4">
                  <div className="group flex items-start gap-4 rounded-xl border border-line bg-paper/60 p-5 transition-all duration-300 hover:border-secondary/40 hover:shadow-elegant">
                    <span className="w-12 h-12 rounded-full bg-secondary-light text-secondary flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <BadgeCheck size={24} />
                    </span>
                    <div>
                      <h3 className="font-display font-semibold uppercase tracking-wide text-ink text-[0.95rem]">{h.about.feature1Title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{h.about.feature1Desc}</p>
                    </div>
                  </div>
                  <div className="group flex items-start gap-4 rounded-xl border border-line bg-paper/60 p-5 transition-all duration-300 hover:border-secondary/40 hover:shadow-elegant">
                    <span className="w-12 h-12 rounded-full bg-secondary-light text-secondary flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <Headset size={24} />
                    </span>
                    <div>
                      <h3 className="font-display font-semibold uppercase tracking-wide text-ink text-[0.95rem]">{h.about.feature2Title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{h.about.feature2Desc}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-9 flex flex-wrap gap-4 items-center">
                  <Link href={localePath(locale, '/gioi-thieu')} className="btn btn-primary">
                    {h.about.ctaJourney} <ArrowRight size={16} />
                  </Link>
                  <Link href={localePath(locale, '/thu-vien')} className="btn btn-outline">
                    {en ? 'Photo & video gallery' : 'Thư viện ảnh & video'}
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 3. Product Categories grid (6 columns) */}
      <section className="py-24 lg:py-28 bg-paper relative border-t border-line">
        <div className="container mx-auto px-4">
          <FadeUp className="mb-16">
            <SectionHeading
              align="center"
              divider
              eyebrow={en ? 'Product lines' : 'Dòng sản phẩm'}
              title={en ? 'The leading veterinary medicine brand of' : 'Thương hiệu dược thú y chất lượng hàng đầu'}
              accent={en ? 'Vietnam' : 'Việt Nam'}
              subtitle={en ? 'A complete portfolio across every farming need — built on GMP-WHO standards.' : 'Danh mục đầy đủ cho mọi nhu cầu chăn nuôi — đạt tiêu chuẩn GMP-WHO.'}
              titleClassName="text-3xl lg:text-4xl"
            />
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {categories.map((cat, i) => (
              <FadeUp key={cat.id} delay={(i % 3) * 0.1}>
                <Link
                  href={localePath(locale, `/san-pham/danh-muc/${cat.slug}`)}
                  className="card-elegant overflow-hidden group flex flex-col h-full"
                >
                  {/* Product line-up image */}
                  <div className="aspect-[4/3] flex items-center justify-center bg-white overflow-hidden relative">
                    <span className="absolute inset-0 bg-gradient-to-t from-primary-light/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img
                      src={categoryImage(cat)}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      className="relative p-6 transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                    />
                  </div>

                  {/* Prominent label bar — fills with brand color on hover */}
                  <div className="relative mt-auto overflow-hidden border-t border-line">
                    <span className="absolute inset-0 bg-secondary origin-bottom scale-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
                    <h3 className="relative z-10 flex items-center justify-center gap-2 py-5 px-4 text-center font-display font-semibold text-[0.95rem] leading-snug text-ink transition-colors duration-300 group-hover:text-white">
                      {cat.name}
                      <ArrowRight
                        size={16}
                        className="shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </h3>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href={localePath(locale, '/san-pham')} className="btn btn-outline bg-white">
              {h.featured.viewAll} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Statistics band */}
      <section className="py-20 lg:py-24 bg-binovet-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-molecule opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(40rem_40rem_at_80%_-10%,rgba(217,83,31,0.18),transparent_60%),radial-gradient(40rem_40rem_at_0%_110%,rgba(10,77,140,0.45),transparent_55%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {stats.map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center group">
                  <div className="glass-dark w-16 h-16 rounded-2xl flex items-center justify-center text-secondary mb-5 transition-transform duration-500 group-hover:-translate-y-1">
                    {s.icon}
                  </div>
                  <CountUp value={s.value} className="font-display text-4xl lg:text-5xl font-semibold text-white mb-2" />
                  <div className="text-[0.8rem] lg:text-[0.85rem] text-white/65 uppercase tracking-[0.16em] font-montserrat">{s.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Latest News — editorial alternating (pinwheel) layout */}
      <section className="py-24 lg:py-28 bg-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <FadeUp className="mb-16">
            <SectionHeading
              align="center"
              divider
              eyebrow={en ? 'Newsroom' : 'Bản tin'}
              title={h.news.titleA}
              accent={h.news.titleB}
              subtitle={h.news.sub}
              titleClassName="text-3xl lg:text-4xl"
            />
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 xl:gap-x-16 gap-y-12 max-w-6xl mx-auto">
            {latestNews.map((a, i) => {
              // Bottom row (items 3 & 4) flips to text-then-image so the
              // photos zigzag across the grid like the reference layout.
              const reverse = i >= 2;
              const href = localePath(locale, `/bai-viet/${a.slug}`);
              return (
                <FadeUp key={a.id} delay={(i % 2) * 0.1}>
                  <article className="group grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 items-start">
                    <Link
                      href={href}
                      className={`block aspect-[4/3] overflow-hidden rounded-xl shadow-elegant ${reverse ? 'sm:order-2' : ''}`}
                    >
                      <img
                        src={a?.thumbnail || '/images/default-article.svg'}
                        alt={a.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        className="transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                    <div className={reverse ? 'sm:order-1' : ''}>
                      <h3 className="font-display font-semibold text-lg lg:text-xl leading-snug text-ink line-clamp-3 transition-colors group-hover:text-primary">
                        <Link href={href}>{a.title}</Link>
                      </h3>
                      {a.excerpt && (
                        <p className="mt-3 text-sm leading-relaxed text-ink-soft line-clamp-3">{a.excerpt}</p>
                      )}
                      <Link
                        href={href}
                        className="mt-4 inline-flex items-center gap-1.5 font-display italic text-sm text-primary transition-colors hover:text-secondary"
                      >
                        {en ? 'See more' : 'Chi tiết'} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </article>
                </FadeUp>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <Link href={localePath(locale, '/tin-tuc')} className="btn btn-outline">
              {h.news.cta} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
