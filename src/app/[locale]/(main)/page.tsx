export const dynamic = 'force-dynamic';

import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Headset, Award, Package, Building2, MapPin, Users,
  FlaskConical, ShieldCheck, PhoneCall, Sparkles,
} from 'lucide-react';
import { productService, articleService, bannerService, mediaService, settingService, categoryService } from '@/services';
import { ProductSummary, ArticleSummary, Category } from '@/types';
import BannerSlider from '@/components/home/BannerSlider';
import IntroVideo from '@/components/home/IntroVideo';
import FadeUp from '@/components/shared/FadeUp';
import CountUp from '@/components/shared/CountUp';
import SectionHeading from '@/components/shared/SectionHeading';
import Monogram from '@/components/shared/Monogram';
import { resolveLocale, localePath } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { localize, localizeAll } from '@/lib/i18n/localize';

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

  const contactHref = localePath(locale, '/lien-he');

  // Hero slides — render the banner's own title as the headline, link as the CTA target.
  const activeBanners = (Array.isArray(banners) ? banners : [])
    .filter((b: any) => b.status)
    .sort((a: any, b: any) => a.order - b.order)
    .map((b: any) => {
      const loc = localize(b, locale) as any;
      return {
        id: Number(b.id),
        image: b.image,
        title: loc.title as string,
        ctaHref: localePath(locale, b.link || '/san-pham'),
      };
    });

  // Latest news — featured news first, topped up with most recent non-draft news.
  const newsPool = articles.filter((a) => (a.category === 'tin-noi-bo' || a.category === 'tin-nganh') && !a.isDraft);
  const featuredNews = newsPool.filter((a) => a.featured);
  const latestNews = [...featuredNews, ...newsPool.filter((a) => !a.featured)].slice(0, 4);

  // Featured products — curated (featured first), topped up to a full grid.
  const featuredProducts = [
    ...products.filter((p) => p.featured),
    ...products.filter((p) => !p.featured),
  ].slice(0, 4);

  const categoryName = (id: ProductSummary['categoryId']) =>
    categories.find((c) => String(c.id) === String(id))?.name || '';

  // Intro video — first active video (featured preferred).
  const videos = Array.isArray(mediaVideos) ? mediaVideos.filter((v: any) => v.status === 'active') : [];
  const introVideo = (videos.find((v: any) => v.featured) || videos[0]) as any;

  // Representative image for each category = first product in that category.
  const categoryImage = (cat: Category) => {
    const prod = products.find((p) => String(p.categoryId) === String(cat.id));
    return prod?.image || '/images/default-product.svg';
  };

  // Premium credential strip beneath the hero.
  const trust = [
    { icon: <FlaskConical size={22} />, title: en ? 'USA Technology' : 'Công nghệ Hoa Kỳ', sub: en ? 'Advanced biotech' : 'Sinh học tiên tiến' },
    { icon: <ShieldCheck size={22} />, title: 'GMP-WHO', sub: en ? 'Certified factory' : 'Nhà máy đạt chuẩn' },
    { icon: <Award size={22} />, title: '20+', sub: en ? 'Years of expertise' : 'Năm kinh nghiệm' },
    { icon: <Users size={22} />, title: '1000+', sub: en ? 'Trusted partners' : 'Khách hàng tin dùng' },
  ];

  // Stats band — PLACEHOLDER figures, edit to real BINOVET numbers.
  const stats = [
    { icon: <Award size={26} />, value: '20+', label: en ? 'Years of experience' : 'Năm kinh nghiệm' },
    { icon: <Package size={26} />, value: `${Math.max(products.length, 100)}+`, label: en ? 'Products' : 'Sản phẩm' },
    { icon: <Building2 size={26} />, value: 'GMP-WHO', label: en ? 'Factory standard' : 'Tiêu chuẩn nhà máy' },
    { icon: <MapPin size={26} />, value: '63', label: en ? 'Provinces covered' : 'Tỉnh thành phủ sóng' },
    { icon: <Users size={26} />, value: '1000+', label: en ? 'Trusted customers' : 'Khách hàng tin dùng' },
  ];

  const hotline = (settings as any)?.hotline1 || '024 6686 1629';

  return (
    <div className="w-full bg-white">
      {/* ════════ 1 · Cinematic hero ════════ */}
      <BannerSlider
        banners={activeBanners}
        eyebrow={en ? 'Veterinary biotechnology' : 'Công nghệ sinh học thú y'}
        subtitle={
          en
            ? 'Over 20 years pioneering American biotechnology in Vietnamese veterinary medicine — every line manufactured to GMP-WHO standards.'
            : 'Hơn 20 năm tiên phong đưa công nghệ sinh học Hoa Kỳ vào dược thú y Việt Nam — mỗi sản phẩm đạt chuẩn GMP-WHO.'
        }
        ctaLabel={en ? 'Explore products' : 'Khám phá sản phẩm'}
        secondaryLabel={en ? 'Talk to an expert' : 'Liên hệ tư vấn'}
        secondaryHref={contactHref}
        scrollLabel={en ? 'Scroll' : 'Cuộn xuống'}
        fallbackTitle={en ? "Vietnam's leading veterinary medicine brand" : 'Thương hiệu dược thú y hàng đầu Việt Nam'}
      />

      {/* ════════ 3 · Company introduction + film ════════ */}
      <section className="py-24 lg:py-28 bg-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <FadeUp>
            <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-center">
              {/* Film + experience medallion — left */}
              <div className="w-full lg:w-1/2 relative">
                <IntroVideo
                  video={introVideo ? { url: introVideo.url, thumbnail: introVideo.thumbnail, title: introVideo.title } : null}
                  youtubeUrl={(settings as any)?.social?.youtube}
                  poster="/images/about.svg"
                  label={en ? 'Company film' : 'Phim giới thiệu'}
                />
                {/* floating experience medallion */}
                <div className="absolute -bottom-7 -right-4 sm:-right-7 z-20 float-slow">
                  <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-white shadow-float border border-line flex flex-col items-center justify-center text-center ring-1 ring-brass/30">
                    <span className="font-display text-3xl lg:text-4xl font-semibold text-primary leading-none">20+</span>
                    <span className="mt-1.5 font-montserrat text-[0.56rem] font-bold uppercase tracking-[0.18em] text-ink-soft px-3 leading-tight">
                      {en ? 'Years of growth' : 'Năm phát triển'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Heading, intro & feature cards — right */}
              <div className="w-full lg:w-1/2">
                <span className="eyebrow mb-5">{en ? 'About us' : 'Về chúng tôi'}</span>
                <h2 className="font-display font-semibold leading-[1.1] tracking-tight text-4xl lg:text-[2.9rem] text-ink">
                  {h.about.titleLine1} <span className="text-primary italic">{h.about.titleLine2}</span>
                </h2>

                <p className="text-ink-soft mt-7 leading-relaxed text-lg">{h.about.paragraph}</p>

                <div className="mt-9 space-y-4">
                  <div className="group flex items-start gap-4 rounded-xl border border-line bg-paper/60 p-5 transition-all duration-300 hover:border-secondary/40 hover:shadow-elegant">
                    <span className="w-12 h-12 rounded-full bg-secondary-light text-secondary flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <BadgeCheck size={24} />
                    </span>
                    <div>
                      <h3 className="font-display font-semibold text-ink text-[1.02rem]">{h.about.feature1Title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{h.about.feature1Desc}</p>
                    </div>
                  </div>
                  <div className="group flex items-start gap-4 rounded-xl border border-line bg-paper/60 p-5 transition-all duration-300 hover:border-secondary/40 hover:shadow-elegant">
                    <span className="w-12 h-12 rounded-full bg-secondary-light text-secondary flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <Headset size={24} />
                    </span>
                    <div>
                      <h3 className="font-display font-semibold text-ink text-[1.02rem]">{h.about.feature2Title}</h3>
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

      {/* ════════ 4 · Signature products ════════ */}
      {featuredProducts.length > 0 && (
        <section className="py-24 lg:py-28 bg-paper border-t border-line relative overflow-hidden">
          <div className="absolute inset-0 bg-helix opacity-60 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <FadeUp className="mb-16">
              <SectionHeading
                align="center"
                divider
                eyebrow={en ? 'Signature products' : 'Sản phẩm tiêu biểu'}
                title={en ? 'Trusted on farms' : 'Được nhà nông tin dùng trên'}
                accent={en ? 'nationwide' : 'mọi miền'}
                subtitle={en ? 'A curated selection of our most trusted veterinary pharmaceutical lines.' : 'Tuyển chọn những dòng dược phẩm thú y được tin dùng rộng rãi nhất.'}
                titleClassName="text-3xl lg:text-4xl"
              />
            </FadeUp>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7">
              {featuredProducts.map((p, i) => (
                <FadeUp key={p.id} delay={(i % 4) * 0.08}>
                  <Link href={localePath(locale, `/san-pham/${p.slug}`)} className="card-elegant overflow-hidden group flex flex-col h-full">
                    <div className="relative aspect-square bg-white overflow-hidden flex items-center justify-center">
                      {p.featured && (
                        <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-white/90 backdrop-blur text-secondary text-[0.6rem] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border border-line font-montserrat">
                          <Sparkles size={11} /> {en ? 'Featured' : 'Nổi bật'}
                        </span>
                      )}
                      <img
                        src={p.image || '/images/default-product.svg'}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        className="p-6 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                      />
                    </div>
                    <div className="border-t border-line p-5 flex flex-col flex-1">
                      {categoryName(p.categoryId) && (
                        <span className="font-montserrat text-[0.6rem] font-bold uppercase tracking-[0.18em] text-secondary mb-2">
                          {categoryName(p.categoryId)}
                        </span>
                      )}
                      <h3 className="font-display font-semibold text-ink leading-snug line-clamp-2 transition-colors group-hover:text-primary">
                        {p.name}
                      </h3>
                      <span className="mt-auto pt-4 inline-flex items-center gap-1.5 font-montserrat text-[0.66rem] font-bold uppercase tracking-[0.16em] text-primary">
                        {en ? 'View details' : 'Xem chi tiết'}
                        <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>

            <div className="text-center mt-14">
              <Link href={localePath(locale, '/san-pham')} className="btn btn-primary">
                {h.featured.viewAll} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════ 5 · Product category lines ════════ */}
      <section className="py-24 lg:py-28 bg-white relative border-t border-line">
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
                  <div className="aspect-[4/3] flex items-center justify-center bg-paper overflow-hidden relative">
                    <span className="absolute top-4 right-5 font-display text-5xl font-semibold text-ink/[0.06] leading-none select-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
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
            <Link href={localePath(locale, '/san-pham')} className="btn btn-outline">
              {h.featured.viewAll} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ 6 · Statistics band ════════ */}
      <section className="py-20 lg:py-24 bg-binovet-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-molecule opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(40rem_40rem_at_80%_-10%,rgba(217,83,31,0.18),transparent_60%),radial-gradient(40rem_40rem_at_0%_110%,rgba(10,77,140,0.45),transparent_55%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <FadeUp className="mb-14 text-center">
            <span className="eyebrow eyebrow--center text-secondary mb-4 justify-center">{en ? 'By the numbers' : 'Những con số'}</span>
            <h2 className="font-display font-semibold text-white text-3xl lg:text-4xl">
              {en ? 'A track record farmers ' : 'Thành tựu được nhà nông '}
              <span className="text-secondary italic">{en ? 'trust' : 'tin tưởng'}</span>
            </h2>
          </FadeUp>
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

      {/* ════════ 7 · Newsroom ════════ */}
      {latestNews.length > 0 && (
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
              {/* Lead story — large */}
              {latestNews[0] && (() => {
                const a = latestNews[0];
                const href = localePath(locale, `/bai-viet/${a.slug}`);
                return (
                  <FadeUp>
                    <article className="group h-full flex flex-col">
                      <Link href={href} className="block aspect-[16/10] overflow-hidden rounded-2xl shadow-elegant-lg">
                        <img
                          src={a?.thumbnail || '/images/default-article.svg'}
                          alt={a.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          className="transition-transform duration-700 group-hover:scale-105"
                        />
                      </Link>
                      <div className="mt-6">
                        <span className="font-montserrat text-[0.62rem] font-bold uppercase tracking-[0.2em] text-secondary">
                          {en ? 'Featured' : 'Tiêu điểm'}
                        </span>
                        <h3 className="mt-3 font-display font-semibold text-2xl lg:text-[1.7rem] leading-snug text-ink line-clamp-3 transition-colors group-hover:text-primary">
                          <Link href={href}>{a.title}</Link>
                        </h3>
                        {a.excerpt && <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft line-clamp-3">{a.excerpt}</p>}
                        <Link href={href} className="mt-5 inline-flex items-center gap-1.5 font-montserrat text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary transition-colors hover:text-secondary">
                          {en ? 'Read article' : 'Đọc bài viết'} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </article>
                  </FadeUp>
                );
              })()}

              {/* Secondary stories — stacked list */}
              <div className="flex flex-col divide-y divide-line">
                {latestNews.slice(1).map((a, i) => {
                  const href = localePath(locale, `/bai-viet/${a.slug}`);
                  return (
                    <FadeUp key={a.id} delay={i * 0.1}>
                      <article className="group grid grid-cols-[7.5rem_1fr] sm:grid-cols-[10rem_1fr] gap-5 py-6 first:pt-0">
                        <Link href={href} className="block aspect-[4/3] overflow-hidden rounded-xl shadow-elegant">
                          <img
                            src={a?.thumbnail || '/images/default-article.svg'}
                            alt={a.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            className="transition-transform duration-700 group-hover:scale-105"
                          />
                        </Link>
                        <div className="flex flex-col justify-center">
                          <h3 className="font-display font-semibold text-[1.05rem] lg:text-lg leading-snug text-ink line-clamp-3 transition-colors group-hover:text-primary">
                            <Link href={href}>{a.title}</Link>
                          </h3>
                          <Link href={href} className="mt-2.5 inline-flex items-center gap-1.5 font-montserrat text-[0.62rem] font-bold uppercase tracking-[0.16em] text-primary transition-colors hover:text-secondary">
                            {en ? 'See more' : 'Chi tiết'} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      </article>
                    </FadeUp>
                  );
                })}
              </div>
            </div>

            <div className="text-center mt-16">
              <Link href={localePath(locale, '/tin-tuc')} className="btn btn-outline">
                {h.news.cta} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════ 8 · Closing CTA ════════ */}
      <section className="relative overflow-hidden box-footer text-white">
        <div className="absolute inset-0 bg-molecule opacity-50 pointer-events-none" />
        <div className="absolute -top-10 -right-10 text-white/[0.05] pointer-events-none select-none hidden md:block">
          <Monogram size={360} withText={false} tone="light" />
        </div>
        <div className="container mx-auto px-4 relative z-10 py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="eyebrow text-secondary mb-5">{en ? 'Partner with us' : 'Đồng hành cùng chúng tôi'}</span>
            <h2 className="font-display font-semibold text-white leading-[1.12] tracking-tight text-3xl sm:text-4xl lg:text-[3rem]">
              {en ? 'Ready to elevate ' : 'Sẵn sàng nâng tầm '}
              <span className="text-secondary italic">{en ? 'your farm?' : 'trang trại của bạn?'}</span>
            </h2>
            <p className="mt-6 text-white/75 text-base lg:text-lg leading-relaxed max-w-2xl">
              {en
                ? 'Our veterinary experts are ready to advise on the right protocol for your herd — from prevention to treatment, anytime.'
                : 'Đội ngũ chuyên gia thú y của chúng tôi luôn sẵn sàng tư vấn phác đồ phù hợp cho đàn vật nuôi — từ phòng bệnh đến điều trị, mọi lúc bạn cần.'}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-5">
              <Link href={contactHref} className="btn btn-accent">
                {en ? 'Contact us' : 'Liên hệ tư vấn'} <ArrowUpRight size={16} />
              </Link>
              <a href={`tel:${hotline.replace(/\s/g, '')}`} className="flex items-center gap-4 group">
                <span className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                  <PhoneCall size={20} />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-montserrat text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/55">
                    {en ? 'Hotline' : 'Tư vấn nhanh'}
                  </span>
                  <span className="font-display text-xl font-semibold text-white group-hover:text-secondary transition-colors">{hotline}</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
