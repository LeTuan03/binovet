export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eye, Home, LayoutGrid, SearchX, ChevronRight } from 'lucide-react';
import { productService, categoryService } from '@/services';
import { ProductSummary, Category } from '@/types';
import Pagination from '@/components/shared/Pagination';
import ProductSearch from '@/components/shared/ProductSearch';
import ProductSort from '@/components/shared/ProductSort';
import FadeUp from '@/components/shared/FadeUp';
import Reveal from '@/components/shared/Reveal';
import PageHero from '@/components/shared/PageHero';
import { resolveLocale, localePath } from '@/lib/i18n/config';
import { localizeAll } from '@/lib/i18n/localize';

const ITEMS_PER_PAGE = 6;

export default async function CategoryPage({ params, searchParams }: Readonly<{
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; search?: string; sort?: string }>;
}>) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const { page, search, sort } = await searchParams;
  const searchTerm = search?.toLowerCase() || '';
  const currentSort = sort || 'newest';

  const products = localizeAll(await productService.getAllSummary(), locale);
  const categories = localizeAll(await categoryService.getAll(), locale);

  const currentCategory = Array.isArray(categories) ? categories.find((c: Category) => c.slug === slug) : undefined;
  
  if (!currentCategory) {
    notFound();
  }

  const currentPage = Number.parseInt(page || '1', 10);
  
  // Filter by category
  let filteredProducts = products.filter((p: ProductSummary) => p.categoryId.toString() === currentCategory.id.toString());

  // Filter by search term
  if (searchTerm) {
    filteredProducts = filteredProducts.filter((p: ProductSummary) =>
      p.name.toLowerCase().includes(searchTerm)
    );
  }

  // Apply sorting
  if (currentSort === 'name-asc') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'name-desc') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.name.localeCompare(a.name));
  } else {
    // Newest (by ID desc)
    filteredProducts = [...filteredProducts].sort((a, b) => Number(b.id) - Number(a.id));
  }
  
  // Pagination logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const urlParams = new URLSearchParams();
  if (searchTerm) urlParams.set('search', searchTerm);
  if (currentSort !== 'newest') urlParams.set('sort', currentSort);
  const baseUrl = urlParams.toString() ? localePath(locale, `/san-pham/danh-muc/${slug}?${urlParams.toString()}`) : localePath(locale, `/san-pham/danh-muc/${slug}`);

  return (
    <div className="bg-white min-h-screen pb-20">
      <PageHero
        locale={locale}
        eyebrow={locale === 'en' ? 'Product category' : 'Danh mục sản phẩm'}
        title={currentCategory.name}
        breadcrumb={[{ label: locale === 'en' ? 'Products' : 'Sản phẩm', href: '/san-pham' }, { label: currentCategory.name }]}
      />

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar */}
          <Reveal direction="left" distance={56} className="w-full lg:w-1/4">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Search Bar */}
              <div className="card-elegant p-6">
                <h3 className="text-lg font-display font-semibold text-ink mb-5 accent-underline pb-1">{locale === 'en' ? 'Search' : 'Tìm kiếm'}</h3>
                <ProductSearch />
              </div>

              <div className="card-elegant p-6">
                <h3 className="text-lg font-display font-semibold text-ink mb-6 accent-underline pb-1">{locale === 'en' ? 'Other categories' : 'Phân loại khác'}</h3>
                <ul className="space-y-1.5">
                  <li>
                    <Link href={localePath(locale, '/san-pham')} className="flex items-center justify-between py-2.5 px-4 rounded-xl transition-all font-medium text-sm text-ink-soft hover:bg-paper hover:text-primary">
                      {locale === 'en' ? 'All products' : 'Tất cả sản phẩm'}
                    </Link>
                  </li>
                  {categories.map((c: Category) => (
                    <li key={c.id}>
                      <Link
                        href={localePath(locale, `/san-pham/danh-muc/${c.slug}`)}
                        className={`flex items-center justify-between py-2.5 px-4 rounded-xl transition-all font-medium text-sm ${c.slug === slug ? 'bg-primary text-white shadow-elegant' : 'text-ink-soft hover:bg-paper hover:text-primary'}`}
                      >
                        <span>{c.name}</span>
                        {c.slug === slug && <ChevronRight size={15} />}
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link href={localePath(locale, '/san-pham')} className="btn btn-outline w-full mt-6">
                  <Home size={15} /> {locale === 'en' ? 'View all' : 'Xem tất cả'}
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Product Grid */}
          <main className="w-full lg:w-3/4">
            {/* Header Controls */}
            <Reveal direction="down" className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 bg-paper p-5 rounded-2xl border border-line gap-4">
              <div className="text-sm text-ink-soft leading-relaxed">
                {searchTerm ? (
                  <span>{locale === 'en' ? 'Search results for' : 'Kết quả tìm kiếm cho'}: <strong className="text-secondary">&ldquo;{searchTerm}&rdquo;</strong> &middot; </span>
                ) : null}
                {locale === 'en' ? 'Showing' : 'Hiển thị'} <strong className="text-ink">{paginatedProducts.length}</strong> {locale === 'en' ? 'of' : 'trên'} <strong className="text-ink">{totalItems}</strong> {locale === 'en' ? 'products' : 'sản phẩm'}
              </div>
              <ProductSort />
            </Reveal>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
                {paginatedProducts.map((p: ProductSummary, index: number) => (
                  <FadeUp key={p.id} delay={index * 0.05}>
                    <Link href={localePath(locale, `/san-pham/${p.slug}`)} className="card-elegant overflow-hidden group flex flex-col h-full">
                      <div className="aspect-square flex items-center justify-center relative bg-paper overflow-hidden">
                        <img src={p.image || '/images/default-product.svg'} alt={p.name} className="h-full w-auto object-contain p-5 transition-transform duration-700 group-hover:scale-105" />
                        <span className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-primary opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                          <Eye size={16} />
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col gap-1.5 border-t border-line text-center">
                        <span className="text-[0.62rem] font-montserrat font-semibold uppercase tracking-[0.16em] text-secondary">{currentCategory.name}</span>
                        <h3 className="font-display font-medium text-ink group-hover:text-primary transition-colors text-base leading-snug">{p.name}</h3>
                      </div>
                    </Link>
                  </FadeUp>
                ))}
              </div>
            ) : (
              <div className="card-elegant py-20 px-6 text-center">
                <span className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-primary/8 text-primary flex items-center justify-center">
                  {searchTerm ? <SearchX size={28} /> : <LayoutGrid size={28} />}
                </span>
                {searchTerm ? (
                  <>
                    <h3 className="text-lg font-display font-semibold text-ink">{locale === 'en' ? 'No products found' : 'Không tìm thấy sản phẩm'}</h3>
                    <p className="text-ink-soft text-sm mt-2">{locale === 'en' ? 'No products match your keyword in this category.' : 'Không tìm thấy sản phẩm nào khớp với từ khóa của bạn trong danh mục này.'}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-display font-semibold text-ink">{locale === 'en' ? 'No products yet' : 'Chưa có sản phẩm'}</h3>
                    <p className="text-ink-soft text-sm mt-2">{locale === 'en' ? 'This category has no products yet. Please check back later.' : 'Danh mục này hiện chưa có sản phẩm nào. Vui lòng quay lại sau.'}</p>
                  </>
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
    </div>
  );
}
