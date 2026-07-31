export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import PageHero from '@/components/shared/PageHero';
import GalleryGrid, { GalleryItem } from '@/components/shared/GalleryGrid';
import { catalogueService, mediaService } from '@/services';
import { resolveLocale } from '@/lib/i18n/config';
import DocumentList from './CatalogueClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const en = resolveLocale((await params).locale) === 'en';
  const title = en ? 'Photo & Video Gallery - BINOVET' : 'Thư viện ảnh & Video - BINOVET';
  const description = en
    ? "Photos and videos of BINOVET's factory, products and standout activities."
    : 'Hình ảnh và video về nhà máy, sản phẩm và các hoạt động nổi bật của BINOVET.';
  return {
    title,
    description,
    alternates: { canonical: 'https://binovet.com/thu-vien' },
    openGraph: {
      title,
      description,
      url: 'https://binovet.com/thu-vien',
    },
  };
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  const en = locale === 'en';

  const [documentsData, imgs, vids] = await Promise.all([catalogueService.getAll(), mediaService.getImages(), mediaService.getVideos()]);
  const documents = (Array.isArray(documentsData) ? documentsData : []).map((doc: any) => ({
    ...doc,
    titleEn: doc.titleEn ?? undefined,
  }));

  const videos: GalleryItem[] = (Array.isArray(vids) ? vids : [])
    .filter((v: any) => v.status === 'active')
    .map((v: any) => ({ id: `vid-${v.id}`, type: 'video', url: v.url, thumbnail: v.thumbnail || '/images/about.svg', title: v.title }));

  const images: GalleryItem[] = (Array.isArray(imgs) ? imgs : [])
    .filter((i: any) => i.status === 'active')
    .map((i: any) => ({ id: `img-${i.id}`, type: 'image', url: i.url, thumbnail: i.url, title: i.title }));

  const items = [...videos, ...images];

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        locale={locale}
        eyebrow={en ? 'Media library' : 'Thư viện'}
        title={en ? 'Slide Gallery' : 'Thư viện ảnh & Video'}
        subtitle={en
          ? 'Photos and videos of our factory, products and standout activities.'
          : 'Hình ảnh và video về nhà máy, sản phẩm và các hoạt động nổi bật của BINOVET.'}
        breadcrumb={[{ label: en ? 'Slide Gallery' : 'Thư viện ảnh' }]}
      />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <DocumentList documents={documents} locale={locale} />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <GalleryGrid items={items} emptyText={en ? 'No media yet.' : 'Chưa có hình ảnh hoặc video.'} />
      </div>
    </div>
  );
}
