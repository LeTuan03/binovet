"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone, Mail, ChevronDown, ChevronRight, Menu, X,
  Search
} from 'lucide-react';
import { FacebookOutlined, YoutubeOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { localePath, switchLocalePath, type Locale } from '@/lib/i18n/config';
import { localize } from '@/lib/i18n/localize';
import { NavMenu, Category, Setting } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [menus, setMenus] = useState<NavMenu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Setting | null>(null);

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    router.push(switchLocalePath(pathname, next));
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const fetchData = async () => {
      try {
        const [menusRes, settingsRes, categoriesRes] = await Promise.all([
          fetch('/api/data/menus'),
          fetch('/api/data/settings'),
          fetch('/api/data/categories'),
        ]);
        const menusData = await menusRes.json();
        const settingsData = await settingsRes.json();
        const categoriesData = await categoriesRes.json();
        if (Array.isArray(menusData)) {
          setMenus(menusData.filter((m: any) => m.position === 'header' || m.position === 'both'));
        }
        setSettings(settingsData);
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch header data', error);
      }
    };
    fetchData();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nameOf = (m: any) => localize(m, locale).name as string;

  const navLinkBase =
    "relative px-3.5 py-2 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-binovet-dark/80 hover:text-primary transition-colors font-montserrat after:content-[''] after:absolute after:left-3.5 after:right-3.5 after:-bottom-0.5 after:h-px after:bg-secondary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <div className="w-full z-50 relative" suppressHydrationWarning>
      {/* Top Bar */}
      <div className="bg-binovet-dark text-white text-[0.73rem] py-2 hidden md:block border-b border-white/5" suppressHydrationWarning>
        <div className="container mx-auto px-4 flex justify-between items-center" suppressHydrationWarning>
          <div className="flex items-center gap-5 flex-wrap">
            <a
              href={`tel:${(settings?.hotline1 || '02466861629').replace(/\s/g, '')}`}
              className="flex items-center gap-2.5 group"
              title={t('header.consultBuy')}
              suppressHydrationWarning
            >
              <span className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-6 w-6 rounded-full bg-secondary opacity-30 animate-ping"></span>
                <span className="relative flex items-center justify-center w-6 h-6 bg-secondary rounded-full">
                  <Phone size={12} className="text-white" />
                </span>
              </span>
              <span className="flex flex-col leading-[1.25]">
                <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-secondary">{t('header.consultBuy')}</span>
                <span className="text-[0.82rem] font-semibold text-white/95 group-hover:text-secondary transition-colors tracking-wide" suppressHydrationWarning>
                  {settings?.hotline1 || '024 6686 1629'}
                  <span className="mx-1.5 text-white/30">·</span>
                  {settings?.hotline2 || '097 499 9204'}
                </span>
              </span>
            </a>
            <span className="flex items-center gap-2 text-white/80 border-l border-white/15 pl-5">
              <Mail size={13} className="shrink-0 text-secondary" />
              <span className="text-white/85 tracking-wide">{settings?.email || 'pkd.binovet@gmail.com'}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 mr-1">
              <Link href={settings?.social?.facebook || "https://www.facebook.com/BiotechVietNam1"} target="_blank" className="text-white/60 hover:text-secondary transition-colors">
                <FacebookOutlined />
              </Link>
              <Link href={settings?.social?.youtube || "https://www.youtube.com/@Biotech-VET"} target="_blank" className="text-white/60 hover:text-secondary transition-colors">
                <YoutubeOutlined />
              </Link>
            </div>
            <div className="flex items-center gap-1.5 border-l border-white/15 pl-4">
              <button
                type="button"
                onClick={() => switchLocale('vi')}
                aria-label="Tiếng Việt"
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all ${locale === 'vi' ? 'bg-white/12 ring-1 ring-white/25' : 'opacity-55 hover:opacity-100'}`}
              >
                <img src="/images/VN.png" alt="VN" className="w-[22px] rounded-sm" />
                <span className="text-[0.62rem] font-semibold tracking-[0.12em]">VI</span>
              </button>
              <button
                type="button"
                onClick={() => switchLocale('en')}
                aria-label="English"
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all ${locale === 'en' ? 'bg-white/12 ring-1 ring-white/25' : 'opacity-55 hover:opacity-100'}`}
              >
                <img src="/images/UK.png" alt="EN" className="w-[22px] rounded-sm" />
                <span className="text-[0.62rem] font-semibold tracking-[0.12em]">EN</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <header className={`w-full sticky top-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-elegant py-2.5 border-line/70' : 'bg-white py-4 border-transparent'}`} suppressHydrationWarning>
        <div className="container mx-auto px-4" suppressHydrationWarning>
          <div className="flex justify-between items-center" suppressHydrationWarning>
            {/* Logo */}
            <Link href={localePath(locale, '/')} className="shrink-0 flex items-center gap-3">
              <img src="/images/logo.png" alt="BINOVET" className={`transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12 md:h-[52px]'}`} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {menus
                .filter(m => m.status && (m.parent === null || m.parent === undefined))
                .sort((a, b) => a.order - b.order)
                .map((menu) => {
                  const children = menus
                    .filter(m => String(m.parent) === String(menu.id) && m.status)
                    .sort((a, b) => a.order - b.order);
                  const hasChildren = children.length > 0;

                  if (menu.hasMega) {
                    return (
                      <div key={menu.id} className="relative group p-0">
                        <Link href={localePath(locale, menu.link)} className={`${navLinkBase} flex items-center gap-1`}>
                          {nameOf(menu)} <ChevronDown size={13} className="group-hover:rotate-180 transition-transform opacity-60" />
                        </Link>
                        <div className="absolute top-full left-0 w-[290px] bg-white shadow-[0_30px_60px_-20px_rgba(6,36,63,0.28)] rounded-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 border border-line z-50 overflow-hidden">
                          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar px-2 space-y-0.5">
                            {categories.map((cat) => (
                              <DropdownItem
                                key={cat.id}
                                href={localePath(locale, `/san-pham/danh-muc/${cat.slug}`)}
                                label={localize(cat, locale).name as string}
                              />
                            ))}
                          </div>
                          <div className="px-4 pt-3 mt-2 border-t border-line">
                            <Link href={localePath(locale, '/san-pham')} className="text-[0.66rem] font-semibold text-primary uppercase tracking-[0.18em] hover:text-secondary transition-colors flex items-center justify-between group/all font-montserrat">
                              {t('header.allProducts')}
                              <ChevronRight size={13} className="group-hover/all:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (hasChildren) {
                    return (
                      <div key={menu.id} className="relative group p-0">
                        <Link href={localePath(locale, menu.link)} className={`${navLinkBase} flex items-center gap-1`}>
                          {nameOf(menu)} <ChevronDown size={13} className="group-hover:rotate-180 transition-transform opacity-60" />
                        </Link>
                        <div className="absolute top-full left-0 w-[260px] bg-white shadow-[0_30px_60px_-20px_rgba(6,36,63,0.28)] rounded-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 border border-line z-50 overflow-hidden">
                          <div className="px-2 space-y-0.5">
                            {children.map((child) => (
                              <Link
                                key={child.id}
                                href={localePath(locale, child.link)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-paper rounded-xl transition-all group/subitem"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/25 group-hover/subitem:bg-secondary group-hover/subitem:scale-150 transition-all"></div>
                                <span className="text-[0.82rem] font-medium text-ink-soft leading-snug group-hover/subitem:text-primary transition-colors">
                                  {nameOf(child)}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (menu.isButton) {
                    return (
                      <Link
                        key={menu.id}
                        href={localePath(locale, menu.link)}
                        className="ml-4 inline-flex items-center px-6 py-2.5 bg-secondary text-white text-[0.72rem] font-semibold rounded-lg hover:bg-[#c0461a] transition-all uppercase tracking-[0.14em] shadow-lg shadow-secondary/20 hover:-translate-y-0.5 active:scale-95 font-montserrat"
                      >
                        {nameOf(menu)}
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={menu.id}
                      href={localePath(locale, menu.link)}
                      className={navLinkBase}
                    >
                      {nameOf(menu)}
                    </Link>
                  );
                })}

              {/* Search */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    router.push(localePath(locale, `/san-pham?search=${encodeURIComponent(searchQuery)}`));
                  }
                }}
                className="relative flex items-center ml-3 group"
              >
                <input
                  type="text"
                  placeholder={t('header.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-10 py-2 w-[140px] lg:w-[180px] text-[0.78rem] bg-paper border border-line rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all placeholder:text-gray-400"
                />
                <button type="submit" className="absolute right-3 text-gray-400 group-focus-within:text-primary hover:text-primary transition-colors">
                  <Search size={17} />
                </button>
              </form>
            </nav>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-primary hover:bg-primary-light rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 top-[70px] bg-white z-50 overflow-y-auto border-t border-line pb-20"
            >
              <div className="p-6 flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-line">
                  <button type="button" onClick={() => switchLocale('vi')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${locale === 'vi' ? 'bg-primary text-white' : 'bg-paper text-gray-500'}`}>
                    <img src="/images/VN.png" alt="VN" className="w-5 rounded-sm" /> Tiếng Việt
                  </button>
                  <button type="button" onClick={() => switchLocale('en')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${locale === 'en' ? 'bg-primary text-white' : 'bg-paper text-gray-500'}`}>
                    <img src="/images/UK.png" alt="EN" className="w-5 rounded-sm" /> English
                  </button>
                </div>
                {menus
                  .filter(m => m.status && m.parent === null)
                  .sort((a, b) => a.order - b.order)
                  .map((menu) => {
                    const children = menus
                      .filter(m => String(m.parent) === String(menu.id) && m.status)
                      .sort((a, b) => a.order - b.order);

                    if (menu.isButton) {
                      return (
                        <Link
                          key={menu.id}
                          href={localePath(locale, menu.link)}
                          className="mt-8 py-4 bg-secondary text-white text-center font-semibold rounded-xl uppercase tracking-[0.14em] shadow-lg shadow-secondary/20 active:scale-95 font-montserrat"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {nameOf(menu)}
                        </Link>
                      );
                    }
                    return (
                      <MobileNavItem
                        key={menu.id}
                        href={localePath(locale, menu.link)}
                        label={nameOf(menu)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        childrenItems={children}
                        locale={locale}
                      />
                    );
                  })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}

function DropdownItem({ href, label }: { href: string, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-paper rounded-xl transition-all group/item">
      <div className="w-1.5 h-1.5 rounded-full bg-primary/25 group-hover/item:bg-secondary group-hover/item:scale-150 transition-all"></div>
      <span className="text-[0.82rem] font-medium text-ink-soft leading-snug group-hover/item:text-primary transition-colors">{label}</span>
    </Link>
  );
}

function MobileNavItem({ href, label, onClick, childrenItems, locale }: { href: string, label: string, onClick: () => void, childrenItems?: NavMenu[], locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = childrenItems && childrenItems.length > 0;

  if (!hasChildren) {
    return (
      <Link href={href} className="py-4 text-[0.95rem] font-semibold text-binovet-dark border-b border-line flex justify-between items-center tracking-tight" onClick={onClick}>
        {label} <ChevronRight size={16} className="text-gray-300" />
      </Link>
    );
  }

  return (
    <div className="border-b border-line">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 text-[0.95rem] font-semibold text-binovet-dark flex justify-between items-center tracking-tight"
      >
        {label} <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-gray-300'}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-paper rounded-xl mb-4"
          >
            <div className="flex flex-col py-2">
              {childrenItems.map((child) => (
                <Link
                  key={child.id}
                  href={localePath(locale, child.link)}
                  className="px-6 py-3 text-sm font-medium text-ink-soft hover:text-primary transition-colors flex items-center gap-3"
                  onClick={onClick}
                >
                  <div className="w-1 h-1 rounded-full bg-primary/30"></div>
                  {localize(child, locale).name as string}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
