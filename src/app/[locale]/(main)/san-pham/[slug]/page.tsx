import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { productService, categoryService } from '@/services';
import { ProductSummary } from '@/types';
import { ChevronRight, ArrowLeft, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { Metadata } from 'next';

import ProductGallery from '@/components/shared/ProductGallery';
import { productSchema } from '@/lib/schema';
import Script from 'next/script';
import { resolveLocale, localePath } from '@/lib/i18n/config';
import { localize, localizeAll } from '@/lib/i18n/localize';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const product = localize(await productService.getBySlug(slug), locale);

  if (!product) {
    return {
      title: locale === 'en' ? 'Product not found - binovet' : 'Sản phẩm không tìm thấy - binovet',
      description: locale === 'en' ? 'The product you are looking for does not exist.' : 'Sản phẩm bạn tìm kiếm không tồn tại.',
    };
  }

  const canonicalUrl = 'https://binovet.com.vn' + localePath(locale, `/san-pham/${product.slug}`);

  return {
    title: locale === 'en' ? `${product.name} - binovet Veterinary Medicine` : `${product.name} - Dược Thú Y binovet`,
    description: locale === 'en' ? `Details for ${product.name} from binovet - USA technology` : `Chi tiết sản phẩm ${product.name} từ binovet - Công nghệ USA`,
    keywords: ['dược thú y', 'binovet', product.name, 'chăn nuôi', 'sản phẩm'],
    robots: 'index, follow',
    openGraph: {
      type: "website",
      title: `${product.name} - binovet`,
      description: locale === 'en' ? `Details for ${product.name}` : `Chi tiết sản phẩm ${product.name}`,
      url: canonicalUrl,
      images: [
        {
          url: product.image || '/images/default-product.svg',
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - binovet`,
      description: locale === 'en' ? 'High-quality veterinary pharmaceuticals' : 'Sản phẩm dược thú y chất lượng cao',
      images: [product.image || '/images/default-product.svg'],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ProductDetailPage({ params }: Readonly<{ params: Promise<{ locale: string; slug: string }> }>) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const rawProduct = await productService.getBySlug(slug);

  if (!rawProduct) {
    notFound();
  }

  const product = localize(rawProduct, locale);
  const category = localize(await categoryService.getById(product.categoryId), locale);
  const products = localizeAll(await productService.getAllSummary(), locale);
  const relatedProducts = products.filter((p: ProductSummary) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
  const featuredProducts = products.filter((p: ProductSummary) => p.featured && p.id !== product.id).slice(0, 4);
  const moreProducts = relatedProducts.length > 0 ? relatedProducts : featuredProducts;

  return (
    <div className="bg-white min-h-[100vh] pb-24">
      <Script
        id={`product-schema-${product.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema({
            id: String(product.id),
            name: product.name,
            description: product.description || undefined,
            image: product.image,
            slug: product.slug,
            category: category?.name
          }))
        }}
      />
      <Script
        id={`breadcrumb-schema-${product.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": locale === 'en' ? 'Home' : 'Trang chủ',
                "item": 'https://binovet.com.vn' + localePath(locale, '/')
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": locale === 'en' ? 'Products' : 'Sản phẩm',
                "item": 'https://binovet.com.vn' + localePath(locale, '/san-pham')
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": product.name,
                "item": 'https://binovet.com.vn' + localePath(locale, `/san-pham/${product.slug}`)
              }
            ]
          })
        }}
      />
      {/* Breadcrumbs */}
      <div className="bg-paper py-4 border-b border-line">
        <div className="container mx-auto px-4 flex items-center text-[0.78rem] font-montserrat font-medium text-ink-soft tracking-wide">
          <Link href={localePath(locale, '/')} className="hover:text-primary transition-colors">{locale === 'en' ? 'Home' : 'Trang chủ'}</Link>
          <ChevronRight size={13} className="mx-2 text-ink-soft/40" />
          <Link href={localePath(locale, '/san-pham')} className="hover:text-primary transition-colors">{locale === 'en' ? 'Products' : 'Sản phẩm'}</Link>
          <ChevronRight size={13} className="mx-2 text-ink-soft/40 hidden sm:block" />
          <span className="text-primary font-semibold hidden sm:block line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <Link href={localePath(locale, '/san-pham')} className="inline-flex items-center gap-2 text-primary hover:text-secondary mb-10 font-montserrat font-semibold text-[0.78rem] uppercase tracking-[0.12em] transition-all group no-print">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {locale === 'en' ? 'Back to catalogue' : 'Quay lại danh mục'}
          </Link>

          {/* Product header (centered, single column) */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="eyebrow eyebrow--center mb-4">{category?.name}</span>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink leading-tight">{product.name}</h1>
            {product.registrationNumber && (
              <div className="mt-4 text-[0.74rem] font-montserrat font-semibold text-ink-soft uppercase tracking-[0.14em]">
                {locale === 'en' ? 'Registration no.' : 'Số đăng ký'}: <span className="text-ink">{product.registrationNumber}</span>
              </div>
            )}
            <div className="divider-diamond mt-7"><span /></div>
          </div>

          {/* Centered product image — refined stage with brass corners */}
          <div className="max-w-xl mx-auto rounded-2xl flex items-center justify-center relative bg-paper border border-line shadow-elegant p-8 mb-10">
            {/* faint brass corner accents */}
            <span className="pointer-events-none absolute top-4 left-4 w-7 h-7 border-t border-l border-brass/50 rounded-tl-lg" />
            <span className="pointer-events-none absolute bottom-4 right-4 w-7 h-7 border-b border-r border-brass/50 rounded-br-lg" />
            <ProductGallery mainImage={product.image || '/images/default-product.svg'} images={product.images ?? []} alt={product.name} />
          </div>

          {/* Short description + order CTA */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            {product.description && (
              <p className="text-base text-ink-soft leading-relaxed whitespace-pre-wrap line-clamp-4 mb-8">{product.description}</p>
            )}
            <Link href={localePath(locale, '/lien-he')} className="btn btn-accent">
              {locale === 'en' ? 'Contact to order' : 'Liên hệ đặt hàng'}
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Specifications — stacked cards */}
          <div className="max-w-3xl mx-auto space-y-6">
            {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
              (product.specifications as any[]).map((spec: any) => (
                <section key={spec.title} className="card-elegant p-7 md:p-8">
                  <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-3.5 pb-4 mb-5 border-b border-line">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                      <FileText size={18} />
                    </span>
                    {spec.title}
                  </h2>
                  <div className="leading-relaxed text-ink-soft whitespace-pre-wrap">
                    {spec.content}
                  </div>
                </section>
              ))
            ) : (
              <div className="card-elegant p-12 text-center">
                <span className="mx-auto mb-5 w-12 h-12 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                  <FileText size={22} />
                </span>
                <p className="text-ink-soft">{locale === 'en' ? 'This product has no detailed specifications yet.' : 'Sản phẩm này chưa có thông số kỹ thuật chi tiết.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related products row */}
        {moreProducts.length > 0 && (
          <section className="mt-24 no-print">
            <div className="text-center mb-10">
              <span className="eyebrow eyebrow--center mb-3">{locale === 'en' ? 'Explore more' : 'Khám phá thêm'}</span>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-ink">{locale === 'en' ? 'Related products' : 'Sản phẩm cùng loại'}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {moreProducts.map((p: ProductSummary) => (
                <Link href={localePath(locale, `/san-pham/${p.slug}`)} key={p.id} className="card-elegant overflow-hidden group flex flex-col">
                  <div className="aspect-square bg-paper p-5 flex items-center justify-center overflow-hidden">
                    <img src={p.image || '/images/default-product.svg'} alt={p.name} className="max-h-full w-auto object-contain group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-4 border-t border-line">
                    <h4 className="font-display font-medium text-ink group-hover:text-primary transition-colors line-clamp-2 text-center text-sm leading-snug">{p.name}</h4>
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
