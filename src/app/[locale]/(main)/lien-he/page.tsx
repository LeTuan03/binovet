import { Metadata } from 'next';
import ContactContent from './ContactContent';
import { settingService } from '@/services';
import { resolveLocale } from '@/lib/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const en = resolveLocale((await params).locale) === 'en';
  const title = en ? 'Contact - BINOVET | 24/7 Technical Support' : 'Liên Hệ - BINOVET | Hỗ Trợ Kỹ Thuật 24/7';
  const description = en
    ? 'Contact BINOVET — we are always ready to listen and answer your questions about veterinary medicines and livestock farming techniques, 24/7.'
    : 'Liên hệ với BINOVET – Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn về dược thú y và kỹ thuật chăn nuôi 24/7.';
  return {
    title,
    description,
    keywords: en
      ? ['contact binovet', 'binovet hotline', 'company address', 'veterinary technical support', 'veterinary consultation']
      : ['liên hệ binovet', 'hotline binovet', 'địa chỉ công ty việt anh', 'hỗ trợ kỹ thuật thú y', 'tư vấn dược thú y'],
    robots: 'index, follow',
    openGraph: {
      title: en ? 'Contact - BINOVET' : 'Liên Hệ - BINOVET',
      description: en
        ? 'Contact BINOVET — technical support and consultation, 24/7.'
        : 'Liên hệ với BINOVET – Hỗ trợ kỹ thuật và tư vấn 24/7.',
      url: 'https://binovet.com.vn/lien-he',
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

export default async function Page() {
  const settings = (await settingService.get()) as any;
  return <ContactContent settings={settings} />;
}
