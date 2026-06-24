"use client";

import React from 'react';
import Link from 'next/link';
import { FacebookOutlined, YoutubeOutlined } from '@ant-design/icons';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { localePath } from '@/lib/i18n/config';
import { localize } from '@/lib/i18n/localize';
import { motion } from 'framer-motion';
import Monogram from '@/components/shared/Monogram';

export default function Footer() {
  const { locale, t } = useLocale();
  const [menus, setMenus] = React.useState<any[]>([]);
  const [settings, setSettings] = React.useState<any>(null);
  const [categories, setCategories] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [menusRes, settingsRes, catRes] = await Promise.all([
          fetch('/api/data/menus'),
          fetch('/api/data/settings'),
          fetch('/api/data/categories'),
        ]);
        const menusData = await menusRes.json();
        const settingsData = await settingsRes.json();
        const catData = await catRes.json();

        if (Array.isArray(menusData)) {
          setMenus(menusData.filter((m: any) => m.position === 'footer' || m.position === 'both'));
        }
        setSettings(settingsData);
        if (Array.isArray(catData)) setCategories(catData.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch footer data', error);
      }
    };
    fetchData();
  }, []);

  const heading = "text-white font-display text-lg font-semibold mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-9 after:h-[2px] after:bg-secondary after:rounded-full tracking-tight";
  const linkClass = "text-white/70 hover:text-secondary transition-colors inline-flex items-center gap-2 group/link";

  return (
    <footer className="box-footer text-white pt-0 pb-8 text-[0.875rem] w-full relative overflow-hidden" suppressHydrationWarning>
      {/* signature motif + monogram watermark */}
      <div className="absolute inset-0 bg-molecule opacity-50 pointer-events-none" />
      <div className="absolute -right-16 -bottom-16 pointer-events-none hidden lg:block">
        <Monogram size={360} withText text={locale === 'en' ? 'BINOVET · HIGH-TECH VETERINARY · ' : undefined} tone="light" className="opacity-[0.05]" />
      </div>

      {/* Signature top band */}
      <div className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Monogram size={52} withText={false} tone="light" className="opacity-90 shrink-0" />
            <div>
              <p className="font-display text-xl font-semibold text-white leading-tight">BINOVET</p>
              <p className="text-white/55 text-xs tracking-[0.18em] uppercase font-montserrat mt-1">
                {locale === 'en' ? 'Advanced Veterinary Technology' : 'Công Nghệ Sinh Học Thú Y'}
              </p>
            </div>
          </div>
          <div className="divider-diamond text-secondary w-full max-w-xs"><span /></div>
          <p className="font-display italic text-white/80 text-lg text-center md:text-right max-w-sm">
            {locale === 'en' ? 'Quality is our commitment.' : 'Chất lượng là cam kết của chúng tôi.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-14" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1 - Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <Link href={localePath(locale, '/')} className="inline-flex mb-3">
              <img src="/images/logo.png" alt="BINOVET" className="h-12 brightness-0 invert" />
            </Link>
            <p className="font-semibold text-white/90">{settings?.companyName || 'Công Ty CP Công Nghệ Sinh Học Thú Y'}</p>
            <p className="text-white/70"><strong className="text-white/80 font-semibold">{t('footer.headquarters')}:</strong> {settings?.addressHN || 'Cụm CN Liên Phương, Xã Hồng Vân, Hà Nội'}</p>
            <p className="text-white/70"><strong className="text-white/80 font-semibold">{t('footer.phone')}:</strong> <a href={`tel:${settings?.hotline1}`} className="hover:text-secondary transition-colors">{settings?.hotline1 || '024 66861629'}</a> | <a href={`tel:${settings?.hotline2}`} className="hover:text-secondary transition-colors">{settings?.hotline2 || '097 499 9204'}</a></p>
            <p className="text-white/70"><strong className="text-white/80 font-semibold">{t('footer.email')}:</strong> <a href={`mailto:${settings?.email}`} className="hover:text-secondary transition-colors">{settings?.email || 'pkd.binovet@gmail.com'}</a></p>
            <p className="text-white/70"><strong className="text-white/80 font-semibold">{t('footer.website')}:</strong> www.binovet.com.vn</p>
            {settings?.addressHCM && (
              <p className="mt-4 pt-4 border-t border-white/10 text-white/70">
                <strong className="text-white/80 font-semibold">{t('footer.southBranch')}:</strong><br />
                {settings.addressHCM}
              </p>
            )}
          </motion.div>

          {/* Col 2 - Product Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className={heading}>{t('footer.productsTitle')}</h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={localePath(locale, `/san-pham/danh-muc/${cat.slug}`)} className={linkClass}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover/link:bg-secondary transition-colors" />
                    {localize(cat, locale).name as string}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li><Link href={localePath(locale, '/san-pham')} className="text-white/70 hover:text-secondary transition-colors">{t('footer.allProducts')}</Link></li>
              )}
            </ul>
          </motion.div>

          {/* Col 3 - Technical Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className={heading}>{t('footer.techSupport')}</h3>
            <div className="mb-6">
              <p className="text-white font-semibold mb-1">{settings?.support?.doctorName || 'Ths.Bs Phùng Thanh Sơn'}</p>
              <p className="text-white/70">Email: <a href={`mailto:${settings?.support?.doctorEmail}`} className="hover:text-secondary transition-colors">{settings?.support?.doctorEmail || 'thanhson256@gmail.com'}</a></p>
              <p className="text-white/70">{t('footer.phone')}: <a href={`tel:${settings?.support?.doctorPhone}`} className="hover:text-secondary transition-colors">{settings?.support?.doctorPhone || '0984 051 978'}</a></p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-white/90 font-semibold mb-4 uppercase text-[0.68rem] tracking-[0.2em] font-montserrat">{t('footer.connectWithUs')}</h4>
              <div className="flex gap-3">
                <a href={settings?.social?.facebook || "https://facebook.com/ThuocThuYbiotechvet"} target="_blank" rel="noopener" className="w-10 h-10 bg-white/8 border border-white/10 hover:bg-secondary hover:border-secondary rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all text-lg">
                  <FacebookOutlined />
                </a>
                <a href={settings?.social?.youtube || "https://www.youtube.com/@Biotech-VET"} target="_blank" rel="noopener" className="w-10 h-10 bg-white/8 border border-white/10 hover:bg-secondary hover:border-secondary rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all text-lg">
                  <YoutubeOutlined />
                </a>
                <a href={`https://zalo.me/${settings?.social?.zalo || "0974999204"}`} target="_blank" rel="noopener" className="w-10 h-10 bg-white/8 border border-white/10 hover:bg-secondary hover:border-secondary rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all text-xs font-semibold">
                  Zalo
                </a>
              </div>
            </div>
          </motion.div>

          {/* Col 4 - Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className={heading}>{t('footer.quickLinks')}</h3>
            <ul className="space-y-2.5">
              {menus.filter(m => m.status && (m.parent === null || m.parent === undefined)).sort((a, b) => a.order - b.order).map((menu) => (
                <li key={menu.id}>
                  <Link href={localePath(locale, menu.link)} className={linkClass}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover/link:bg-secondary transition-colors" />
                    {localize(menu, locale).name as string}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-white/45 text-[0.8rem]">
          <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
          <p className="font-montserrat tracking-[0.18em] uppercase text-[0.66rem]">BinoVet · GMP-WHO</p>
        </div>
      </div>
    </footer>
  );
}
