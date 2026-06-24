import { MetadataRoute } from 'next';
import { productService, articleService, categoryService } from '@/services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://binovet.com.vn';

  // Static routes
  const staticRoutes = [
    '',
    '/gioi-thieu',
    '/lien-he',
    '/san-pham',
    '/tin-tuc',
    '/thu-vien',
    '/tin-tuc-nganh-chan-nuoi-thu-y',
    '/tin-tuc-noi-bo',
    '/cam-nang-chan-nuoi',
    '/benh-va-dieu-tri-benh',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes - Products
  const products = await productService.getAllSummary();
  const productRoutes = products.map((product: any) => ({
    url: `${baseUrl}/san-pham/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Dynamic routes - Articles
  const articles = await articleService.getAllSummary();
  const articleRoutes = articles
    .filter((article: any) => !article.isDraft)
    .map((article: any) => ({
      url: `${baseUrl}/bai-viet/${article.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }));

  // Dynamic routes - Categories
  const categories = await categoryService.getAll();
  const categoryRoutes = categories.map((category: any) => ({
    url: `${baseUrl}/san-pham/danh-muc/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes, ...categoryRoutes];
}
