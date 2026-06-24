import { Metadata } from 'next';
import { Suspense } from 'react';
import AboutContent from './AboutContent';
import { resolveLocale } from '@/lib/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const en = resolveLocale((await params).locale) === 'en';
  const title = en
    ? 'About - BINOVET | Veterinary Biotechnology JSC'
    : 'Giới Thiệu - BINOVET | Công Ty Cổ Phần Công Nghệ Sinh Học Thú Y';
  const description = en
    ? 'Discover BINOVET - Veterinary Biotechnology JSC, a pioneer in USA-technology veterinary pharmaceutical manufacturing in Vietnam.'
    : 'Tìm hiểu về BINOVET - Công Ty Cổ Phần Công Nghệ Sinh Học Thú Y, đơn vị tiên phong trong sản xuất dược thú y công nghệ USA tại Việt Nam.';
  return {
    title,
    description,
    keywords: en
      ? ['about binovet', 'veterinary biotechnology', 'veterinary pharmaceutical factory', 'binovet history', 'vision mission']
      : ['giới thiệu binovet', 'công ty việt anh', 'nhà máy dược thú y', 'lịch sử binovet', 'tầm nhìn sứ mệnh'],
    robots: 'index, follow',
    openGraph: {
      title: en ? 'About - BINOVET' : 'Giới Thiệu - BINOVET',
      description: en
        ? 'Discover BINOVET - a pioneer in USA-technology veterinary pharmaceutical manufacturing in Vietnam.'
        : 'Tìm hiểu về BINOVET - Đơn vị tiên phong sản xuất dược thú y công nghệ USA tại Việt Nam.',
      url: 'https://binovet.com.vn/gioi-thieu',
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

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
      <AboutContent />
    </Suspense>
  );
}
