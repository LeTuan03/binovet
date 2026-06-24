"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Newspaper, ChevronRight, Images, Building2, MessageSquare, Home } from 'lucide-react';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { localePath } from '@/lib/i18n/config';
import { localizeAll } from '@/lib/i18n/localize';

interface SidebarProps {
  showProducts?: boolean;
  showNews?: boolean;
  showQuickLinks?: boolean;
}

export default function Sidebar({ showProducts = true, showNews = true, showQuickLinks = true }: SidebarProps) {
  const { locale } = useLocale();
  const [products, setProducts] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          fetch('/api/data/products?summary=1'),
          fetch('/api/data/articles?summary=1')
        ]);
        const pData = await pRes.json();
        const aData = await aRes.json();
        setProducts(pData);
        setArticles(aData);
      } catch (error) {
        console.error('Failed to fetch sidebar data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-40 bg-sand rounded-2xl"></div><div className="h-40 bg-sand rounded-2xl"></div></div>;

  const featuredProducts = localizeAll(products.filter((p: any) => p.featured).slice(0, 7), locale);
  const latestNews = localizeAll(articles.filter((a: any) => !a.isDraft).slice(0, 5), locale);

  const quickLinks = [
    { href: '/thu-vien', label: locale === 'en' ? 'Slide gallery' : 'Thư viện ảnh & video', icon: Images },
    { href: '/gioi-thieu', label: locale === 'en' ? 'About the company' : 'Giới thiệu công ty', icon: Building2 },
    { href: '/lien-he', label: locale === 'en' ? 'Contact for advice' : 'Liên hệ tư vấn', icon: MessageSquare },
    { href: '/', label: locale === 'en' ? 'Home' : 'Trang chủ', icon: Home },
  ];

  return (
    <div className="sticky top-24 space-y-8">
      {/* Featured Products */}
      {showProducts && (
        <div className="card-elegant p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/8 text-primary flex items-center justify-center shrink-0">
              <Package size={18} />
            </div>
            <h3 className="font-display font-semibold text-lg text-ink leading-tight">{locale === 'en' ? 'Featured products' : 'Sản phẩm nổi bật'}</h3>
          </div>
          <div className="space-y-4">
            {featuredProducts.map((p: any) => (
              <Link href={localePath(locale, `/san-pham/${p.slug}`)} key={p.id} className="flex gap-4 group">
                <div className="w-16 h-16 bg-white rounded-xl border border-line p-1.5 flex items-center justify-center shrink-0 group-hover:border-primary group-hover:shadow-elegant transition-all">
                  <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-semibold text-ink group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug">{p.name}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Latest News */}
      {showNews && (
        <div className="card-elegant p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Newspaper size={18} />
            </div>
            <h3 className="font-display font-semibold text-lg text-ink leading-tight">{locale === 'en' ? 'Latest news' : 'Tin tức mới nhất'}</h3>
          </div>
          <div className="space-y-4">
            {latestNews.map((a: any) => (
              <Link href={localePath(locale, `/bai-viet/${a.slug}`)} key={a.id} className="flex gap-4 group">
                <div className="w-16 h-16 bg-sand rounded-xl overflow-hidden shrink-0">
                  <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-semibold text-ink group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug">{a.title}</h4>
                  <span className="text-[10px] font-semibold text-ink-soft/70 mt-1.5 uppercase tracking-[0.15em] font-montserrat">{a.publishDate}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      {showQuickLinks && (
        <div className="box-footer p-7 rounded-2xl text-white relative overflow-hidden">
          <div className="bg-molecule absolute inset-0 opacity-50 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-display font-semibold text-lg mb-6 border-b border-white/10 pb-4 text-white">{locale === 'en' ? 'Quick links' : 'Liên kết nhanh'}</h3>
            <ul className="space-y-1.5">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link href={localePath(locale, link.href)} className="flex items-center gap-3 text-white/75 hover:text-white py-2 transition-colors font-medium text-sm group">
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-secondary transition-colors">
                        <Icon size={15} />
                      </span>
                      <span className="flex-1">{link.label}</span>
                      <ChevronRight size={15} className="opacity-40 group-hover:opacity-90 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
