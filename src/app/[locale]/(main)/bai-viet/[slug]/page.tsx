export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articleService } from '@/services';
import { ArticleSummary } from '@/types';
import { Calendar, ChevronRight, ArrowLeft, Tag } from 'lucide-react';
import ArticleActions from '@/components/shared/ArticleActions';
import { Metadata } from 'next';
import Script from 'next/script';
import { articleSchema } from '@/lib/schema';
import { resolveLocale, localePath } from '@/lib/i18n/config';
import { localize, localizeAll } from '@/lib/i18n/localize';

function decodeHtmlEntities(str: string): string {
  const named: Record<string, string> = {
    nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  };
  return str
    .replaceAll(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replaceAll(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replaceAll(/&([a-z]+);/gi, (m, name) => named[name.toLowerCase()] ?? m);
}

function processContentWithHeadings(html: string): { processedHtml: string, headings: { id: string; text: string }[] } {
  const headings: { id: string; text: string }[] = [];
  let processedHtml = html;

  if (processedHtml) {
    processedHtml = processedHtml.replaceAll(/<(h[1-6])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, innerHtml) => {
      const text = decodeHtmlEntities(innerHtml.replaceAll(/<[^>]*>/g, '')).replaceAll(/\s+/g, ' ').trim();
      if (!text) return match;
      const id = text.toLowerCase().replaceAll(/[^a-z0-9\u00C0-\u024F]+/gi, '-').replaceAll(/^-|-$/g, '');
      headings.push({ id, text });

      if (!attrs.includes('id=')) {
        return `<${tag}${attrs} id="${id}">${innerHtml}</${tag}>`;
      }
      return match;
    });
  }
  
  return { processedHtml, headings };
}

function getCategoryLabel(category: string, locale: 'vi' | 'en'): string {
  if (locale === 'en') {
    switch (category) {
      case 'benh-dieu-tri': return 'Diseases & Treatment';
      case 'cam-nang': return 'Farming Handbook';
      case 'tin-noi-bo': return 'Internal News';
      case 'tin-nganh': return 'Industry News';
      default: return 'Article';
    }
  }
  switch (category) {
    case 'benh-dieu-tri': return 'Bệnh & Điều Trị';
    case 'cam-nang': return 'Cẩm Nang Chăn Nuôi';
    case 'tin-noi-bo': return 'Tin Nội Bộ';
    case 'tin-nganh': return 'Tin Ngành';
    default: return 'Bài Viết';
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const raw = await articleService.getBySlug(p.slug);

  if (!raw || raw.isDraft) {
    return {
      title: locale === 'en' ? 'Article not found - binovet' : 'Bài viết không tìm thấy - binovet',
      description: locale === 'en' ? 'The article you are looking for does not exist.' : 'Bài viết bạn tìm kiếm không tồn tại.',
    };
  }

  const article = localize(raw, locale);
  const plainTextContent = article.content?.replaceAll(/<[^>]*>/g, '').substring(0, 160) || article.title;
  const articleImage = article.thumbnail || "/images/default-article.svg";

  return {
    title: `${article.title} - binovet`,
    description: plainTextContent,
    keywords: ['binovet', 'dược thú y', 'chăn nuôi', article.title?.toLowerCase()].filter(Boolean),
    authors: [{ name: "binovet Editor" }],
    robots: "index, follow",
    openGraph: {
      type: "article",
      title: article.title,
      description: plainTextContent,
      url: `https://binovet.com.vn${localePath(locale, `/bai-viet/${article.slug}`)}`,
      siteName: "BINOVET",
      publishedTime: article.publishDate,
      authors: ["Binovet Team"],
      images: [
        {
          url: articleImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: plainTextContent,
      images: [articleImage],
    },
    alternates: {
      canonical: `https://binovet.com.vn${localePath(locale, `/bai-viet/${article.slug}`)}`,
    },
  };
}

export default async function ArticleDetailPage({ params }: Readonly<{ params: Promise<{ locale: string; slug: string }> }>) {
  const p = await params;
  const locale = resolveLocale(p.locale);
  const rawArticle = await articleService.getBySlug(p.slug);
  const articles = await articleService.getAllSummary();

  if (!rawArticle || rawArticle.isDraft) {
    notFound();
  }

  const article = localize(rawArticle, locale);

  // Get related articles
  const relatedArticles = localizeAll(
    articles
      .filter((a: ArticleSummary) => a.category === article.category && a.id !== article.id && !a.isDraft)
      .slice(0, 3),
    locale,
  );

  // Process content (inject heading IDs for anchor links)
  const { processedHtml } = processContentWithHeadings(article.content || "");

  return (
    <div className="bg-white min-h-screen">
      <Script
        id={`article-schema-${article.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema({
            title: article.title,
            description: article.content?.replaceAll(/<[^>]*>/g, '').substring(0, 160) || "",
            publishDate: article.publishDate,
            slug: article.slug,
            image: article.thumbnail,
          }))
        }}
      />
      <Script
        id={`breadcrumb-schema-${article.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": locale === 'en' ? "Home" : "Trang chủ",
                "item": `https://binovet.com.vn${localePath(locale, '/')}`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": locale === 'en' ? "News" : "Tin tức",
                "item": `https://binovet.com.vn${localePath(locale, '/tin-tuc')}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": article.title,
                "item": `https://binovet.com.vn${localePath(locale, `/bai-viet/${article.slug}`)}`
              }
            ]
          })
        }}
      />
      {/* Breadcrumbs */}
      <div className="bg-cream border-b border-line py-4 no-print">
        <div className="container mx-auto px-4 flex items-center text-[0.72rem] font-montserrat font-semibold uppercase tracking-[0.18em] text-ink-soft/70">
          <Link href={localePath(locale, '/')} className="hover:text-primary transition-colors">{locale === 'en' ? 'Home' : 'Trang chủ'}</Link>
          <ChevronRight size={12} className="mx-2 opacity-50" />
          <Link href={localePath(locale, '/tin-tuc')} className="hover:text-primary transition-colors">{locale === 'en' ? 'News & Articles' : 'Tin tức & Bài viết'}</Link>
          <ChevronRight size={12} className="mx-2 opacity-50 hidden sm:block" />
          <span className="text-primary line-clamp-1 hidden sm:block normal-case tracking-normal font-display text-sm">{article.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Single-column article (sanfovet-style) */}
        <article className="max-w-3xl mx-auto print:max-w-none print:m-0 print:p-0">
          <Link href={localePath(locale, '/tin-tuc')} className="inline-flex items-center gap-2 text-primary hover:text-secondary mb-8 font-montserrat font-semibold text-xs uppercase tracking-[0.16em] transition-all group no-print">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {locale === 'en' ? 'Back to list' : 'Quay lại danh sách'}
          </Link>

          <header className="mb-10 text-center">
            <span className="inline-block mb-5 font-montserrat font-bold text-[0.7rem] uppercase tracking-[0.3em] text-primary">{getCategoryLabel(article.category, locale)}</span>
            <h1 className="font-display font-semibold text-3xl md:text-5xl text-ink leading-[1.12] mb-6">
              {article.title}
            </h1>
            <div className="flex items-center justify-center gap-2 text-[0.72rem] text-ink-soft font-montserrat font-semibold uppercase tracking-[0.16em] no-print">
              <Calendar size={14} className="text-secondary" /> {article.publishDate}
            </div>
            <div className="divider-diamond mt-7"><span /></div>
          </header>

          <div className="article-content prose prose-editorial max-w-none prose-h2:scroll-mt-32" dangerouslySetInnerHTML={{ __html: processedHtml }} />

          {/* Category tags + share */}
          <div className="mt-12 pt-7 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-5 no-print">
            <Link
              href={localePath(locale, '/tin-tuc')}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-2 text-ink-soft hover:border-primary hover:text-primary transition-all"
            >
              <Tag size={14} className="text-secondary" />
              <span className="text-[0.68rem] font-montserrat font-bold uppercase tracking-[0.16em] text-primary">{getCategoryLabel(article.category, locale)}</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-[0.7rem] font-montserrat font-semibold text-ink-soft uppercase tracking-[0.16em]">{locale === 'en' ? 'Share' : 'Chia sẻ'}</span>
              <ArticleActions />
            </div>
          </div>
        </article>

        {/* Related Articles row */}
        {relatedArticles.length > 0 && (
          <section className="max-w-6xl mx-auto mt-24 no-print">
            <div className="text-center mb-12">
              <span className="eyebrow eyebrow--center mb-3">{locale === 'en' ? 'Keep reading' : 'Đọc tiếp'}</span>
              <h3 className="font-display font-semibold text-2xl md:text-3xl text-ink">{locale === 'en' ? 'Related articles' : 'Bài viết liên quan'}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {relatedArticles.map((a: ArticleSummary) => (
                <Link href={localePath(locale, `/bai-viet/${a.slug}`)} key={a.id} className="card-elegant overflow-hidden group flex flex-col">
                  <div className="aspect-[16/10] bg-sand overflow-hidden relative">
                    <img src={a.thumbnail || '/images/default-article.svg'} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-primary text-[0.66rem] font-montserrat font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      {getCategoryLabel(a.category, locale)}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="inline-flex items-center gap-1.5 text-[0.66rem] font-montserrat font-semibold text-ink-soft mb-3 uppercase tracking-[0.16em]"><Calendar size={13} className="text-secondary" /> {a.publishDate}</span>
                    <h4 className="font-display font-semibold text-lg text-ink group-hover:text-primary transition-colors line-clamp-2 leading-snug">{a.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
