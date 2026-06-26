export const dynamic = 'force-dynamic';

import { productService, categoryService } from '@/services';
import { Category, ProductSummary } from '@/types';
import Pagination from '@/components/shared/Pagination';
import FadeUp from '@/components/shared/FadeUp';
import Reveal from '@/components/shared/Reveal';
import ProductSearch from '@/components/shared/ProductSearch';
import PageHero from '@/components/shared/PageHero';
import { Metadata } from 'next';
import { Eye, SearchX, ChevronRight } from 'lucide-react';
import ProductSort from '@/components/shared/ProductSort';
import Link from 'next/link';
import { resolveLocale, localePath } from '@/lib/i18n/config';
import { localizeAll } from '@/lib/i18n/localize';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const en = resolveLocale((await params).locale) === 'en';
  const title = en ? 'Products - binovet' : 'Danh mục Sản phẩm - binovet';
  const description = en
    ? 'Catalogue of high-quality veterinary medicines, supplements and antibiotics from binovet. GMP-WHO standard products built on advanced USA technology.'
    : 'Danh mục các loại dược thú y, thuốc bổ trợ, kháng sinh chất lượng cao từ binovet. Sản phẩm đạt chuẩn GMP-WHO với công nghệ tiên tiến từ USA.';
  return {
    title,
    description,
    keywords: en
      ? ['veterinary medicine', 'supplements', 'antibiotics', 'binovet', 'livestock products']
      : ['dược thú y', 'thuốc bổ trợ', 'kháng sinh', 'binovet', 'sản phẩm chăn nuôi'],
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: 'https://binovet.com.vn/san-pham',
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

const ITEMS_PER_PAGE = 12;

export default async function ProductsPage({ params: routeParams, searchParams }: Readonly<{ params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string; page?: string; search?: string; sort?: string }> }>) {
  const { locale: rawLocale } = await routeParams;
  const locale = resolveLocale(rawLocale);
  const params = await searchParams;
  const currentCategory = params.category;
  const currentPage = Number.parseInt(params.page || '1', 10);
  const searchTerm = params.search?.toLowerCase() || '';
  const sort = params.sort || 'newest';

  const products = localizeAll(await productService.getAllSummary(), locale);
  const categories = localizeAll(await categoryService.getAll(), locale);

  // Filter products
  let filteredProducts = products;

  // Filter by category
  if (currentCategory) {
    filteredProducts = filteredProducts.filter((p: ProductSummary) => {
      const cat = categories.find((c: Category) => c.id.toString() === p.categoryId.toString());
      return cat?.slug === currentCategory;
    });
  }

  // Filter by search term
  if (searchTerm) {
    filteredProducts = filteredProducts.filter((p: ProductSummary) =>
      p.name.toLowerCase().includes(searchTerm)
    );
  }

  // Apply sorting
  if (sort === 'name-asc') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'name-desc') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.name.localeCompare(a.name));
  } else {
    // Newest (by ID desc)
    filteredProducts = [...filteredProducts].sort((a, b) => Number(b.id) - Number(a.id));
  }

  const activeCategory = categories.find((c: Category) => c.slug === currentCategory);
  
  // Pagination logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Construct baseUrl for pagination
  const urlParams = new URLSearchParams();
  if (currentCategory) urlParams.set('category', currentCategory);
  if (searchTerm) urlParams.set('search', searchTerm);
  if (sort !== 'newest') urlParams.set('sort', sort);
  const baseUrl = urlParams.toString() ? localePath(locale, `/san-pham?${urlParams.toString()}`) : localePath(locale, '/san-pham');

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        locale={locale}
        eyebrow={locale === 'en' ? 'Our catalogue' : 'Danh mục sản phẩm'}
        title={activeCategory ? activeCategory.name : (locale === 'en' ? 'Veterinary Products' : 'Sản phẩm thú y')}
        subtitle={activeCategory
          ? (locale === 'en' ? `Explore the product lines in the ${activeCategory.name} category` : `Khám phá các dòng sản phẩm thuộc danh mục ${activeCategory.name}`)
          : (locale === 'en' ? 'A full catalogue of high-quality veterinary pharmaceuticals built on USA technology.' : 'Danh mục đầy đủ các sản phẩm dược thú y chất lượng cao, công nghệ Hoa Kỳ.')}
        breadcrumb={activeCategory
          ? [{ label: locale === 'en' ? 'Products' : 'Sản phẩm', href: '/san-pham' }, { label: activeCategory.name }]
          : [{ label: locale === 'en' ? 'Products' : 'Sản phẩm' }]}
      />

      <div className="container mx-auto px-4 py-16 lg:py-24 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar Filters */}
        <Reveal direction="left" distance={56} className="w-full lg:w-1/4">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Search Bar */}
            <div className="card-elegant p-6">
              <h2 className="font-display font-semibold text-ink mb-5 text-lg accent-underline pb-1">
                {locale === 'en' ? 'Search' : 'Tìm kiếm'}
              </h2>
              <ProductSearch />
            </div>

            <div className="card-elegant p-6">
              <h2 className="font-display font-semibold text-ink mb-6 text-lg accent-underline pb-1">
                {locale === 'en' ? 'Product categories' : 'Danh mục sản phẩm'}
              </h2>
              <ul className="space-y-1.5">
                <li>
                  <Link href={localePath(locale, '/san-pham')} className={`flex items-center justify-between py-2.5 px-4 rounded-xl transition-all font-medium text-sm ${!currentCategory ? 'bg-primary text-white shadow-elegant' : 'text-ink-soft hover:bg-paper hover:text-primary'}`}>
                    <span>{locale === 'en' ? 'All products' : 'Tất cả sản phẩm'}</span>
                    {!currentCategory && <ChevronRight size={15} />}
                  </Link>
                </li>
                {categories.map((c: Category) => (
                  <li key={c.id}>
                    <Link
                      href={localePath(locale, `/san-pham/danh-muc/${c.slug}`)}
                      className={`flex items-center justify-between py-2.5 px-4 rounded-xl transition-all font-medium text-sm ${currentCategory === c.slug ? 'bg-primary text-white shadow-elegant' : 'text-ink-soft hover:bg-paper hover:text-primary'}`}
                    >
                      <span>{c.name}</span>
                      {currentCategory === c.slug && <ChevronRight size={15} />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* Product Grid */}
        <main className="w-full lg:w-3/4">
          <Reveal direction="down" className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-paper p-5 rounded-2xl border border-line gap-4">
            <div className="text-ink-soft text-sm leading-relaxed">
              {searchTerm ? (
                <span>{locale === 'en' ? 'Search results for' : 'Kết quả tìm kiếm cho'}: <strong className="text-secondary">&ldquo;{searchTerm}&rdquo;</strong> &middot; </span>
              ) : null}
              {locale === 'en' ? 'Showing' : 'Hiển thị'} <strong className="text-ink">{paginatedProducts.length}</strong> {locale === 'en' ? 'of' : 'trên'} <strong className="text-ink">{totalItems}</strong> {locale === 'en' ? 'products' : 'sản phẩm'} {activeCategory && (locale === 'en' ? `in ${activeCategory.name}` : `trong ${activeCategory.name}`)}
            </div>
            <ProductSort />
          </Reveal>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {paginatedProducts.map((p: ProductSummary, index: number) => {
                const cat = categories.find((c: Category) => c.id.toString() === p.categoryId.toString());
                return (
                  <FadeUp key={p.id} delay={index * 0.05}>
                    <Link href={localePath(locale, `/san-pham/${p.slug}`)} className="card-elegant overflow-hidden group flex flex-col h-full">
                      <div className="aspect-square flex items-center justify-center relative bg-paper overflow-hidden">
                        <img src={p.image || '/images/default-product.svg'} alt={p.name} className="h-full w-auto object-contain p-5 transition-transform duration-700 group-hover:scale-105" />
                        <span className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-primary opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                          <Eye size={16} />
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col gap-1.5 border-t border-line text-center">
                        {cat && <span className="text-[0.62rem] font-montserrat font-semibold uppercase tracking-[0.16em] text-secondary">{cat.name}</span>}
                        <h3 className="font-display font-medium text-ink group-hover:text-primary transition-colors text-base leading-snug">{p.name}</h3>
                      </div>
                    </Link>
                  </FadeUp>
                );
              })}
            </div>
          ) : (
            <div className="card-elegant py-20 px-6 text-center">
              <span className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-primary/8 text-primary flex items-center justify-center">
                <SearchX size={28} />
              </span>
              <p className="text-ink font-display font-semibold text-lg">{locale === 'en' ? 'No products found' : 'Không tìm thấy sản phẩm nào'}</p>
              {searchTerm && (
                <p className="text-ink-soft text-sm mt-2">{locale === 'en' ? 'Try a different keyword or browse the full catalogue.' : 'Hãy thử từ khóa khác hoặc xem toàn bộ danh mục.'}</p>
              )}
              {searchTerm && (
                <Link href={localePath(locale, '/san-pham')} className="btn btn-outline mt-7">
                  {locale === 'en' ? 'View all products' : 'Xem tất cả sản phẩm'}
                </Link>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={baseUrl}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
