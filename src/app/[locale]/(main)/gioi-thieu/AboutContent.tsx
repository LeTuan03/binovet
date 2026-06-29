"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2, History, Target, Award, Heart, Factory, Users,
  ArrowRight, ShieldCheck, Quote, BadgeCheck, Sparkles, Leaf,
} from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import SectionHeading from '@/components/shared/SectionHeading';
import { aboutDefaults, aboutDefaultsEn, mergeAbout } from './aboutDefaults';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { localePath } from '@/lib/i18n/config';

// Icons cycled across the core-value cards (order matches aboutDefaults).
const VALUE_ICONS = [BadgeCheck, Sparkles, ShieldCheck, Users, Leaf] as const;

const sectionDefs = [
  { id: 'gioi-thieu', label: 'Giới thiệu', labelEn: 'Overview', icon: Building2 },
  // { id: 'lich-su', label: 'Lịch sử', labelEn: 'History', icon: History },
  { id: 'tam-nhin', label: 'Tầm nhìn', labelEn: 'Vision', icon: Target },
  { id: 'co-so', label: 'Cơ sở', labelEn: 'Facilities', icon: Factory },
  // { id: 'thanh-tuu', label: 'Thành tựu', labelEn: 'Achievements', icon: Award },
  { id: 'co-cau', label: 'Cơ cấu', labelEn: 'Structure', icon: Users },
];

type RevealDir = 'up' | 'down' | 'left' | 'right';

export default function AboutContent() {
  const { locale } = useLocale();
  const en = locale === 'en';

  // Directional scroll-reveal props for the inline motion blocks:
  // `up` rises, `down` drops in (trượt xuống), `left`/`right` slide sideways
  // (trượt sang). NOTE: intentionally NOT branched on `useReducedMotion()` —
  // that diverges between server (animated) and client (static) and trips a
  // hydration mismatch that can freeze content invisible. Framer Motion's
  // default keeps it playing; ambient CSS loops are calmed in globals.css.
  const anim = (direction: RevealDir = 'up', delay = 0) => {
    const distance = 48;
    const from =
      direction === 'up' ? { y: distance }
      : direction === 'down' ? { y: -distance }
      : direction === 'left' ? { x: -distance }
      : { x: distance };
    return {
      initial: { opacity: 0, ...from },
      whileInView: { opacity: 1, x: 0, y: 0 },
      viewport: { once: true, amount: 0.2 },
      transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
    };
  };
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [content, setContent] = useState(en ? aboutDefaultsEn : aboutDefaults);
  const [active, setActive] = useState(sectionDefs[0].id);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/data/settings')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!cancelled && data) {
          const stored = locale === 'en' ? data?.aboutPageEn : data?.aboutPage;
          setContent(mergeAbout(stored, locale));
        }
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [locale, en]);

  // Scrollspy — highlight the section currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sectionDefs.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Deep-link support: ?tab=<id> scrolls to that section (keeps old links working).
  useEffect(() => {
    if (tabParam && sectionDefs.some((s) => s.id === tabParam)) {
      const t = setTimeout(() => {
        document.getElementById(tabParam)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
      return () => clearTimeout(t);
    }
  }, [tabParam]);

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="bg-white">
      <PageHero
        locale={locale}
        eyebrow={en ? 'The binovet story' : 'Câu chuyện binovet'}
        title={
          <>
            {en ? 'About ' : 'Về '}
            <span className="text-secondary">Binovet</span>
          </>
        }
        subtitle={
          en
            ? 'A 20-year journey alongside Vietnamese farmers, creating sustainable value and delivering comprehensive veterinary solutions.'
            : 'Hành trình 20 năm đồng hành cùng người chăn nuôi Việt Nam, kiến tạo những giá trị bền vững và mang lại giải pháp thú y toàn diện.'
        }
        breadcrumb={[{ label: en ? 'About' : 'Giới thiệu' }]}
        sideImage="/images/gioithieu.webp"
        sideImageAlt={en ? 'About Binovet' : 'Giới thiệu Binovet'}
      />

      {/* Sticky scrollspy section nav */}
      <nav className="sticky top-0 z-30 bg-white">
        <div className="glass border-y border-line/70">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto hide-scrollbar">
              {sectionDefs.map((s) => {
                const Icon = s.icon;
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => go(s.id)}
                    className={`shrink-0 flex items-center gap-2 px-4 lg:px-6 py-4 text-[0.72rem] font-montserrat font-semibold uppercase tracking-[0.12em] border-b-2 transition-colors duration-300 ${
                      isActive
                        ? 'border-secondary text-primary'
                        : 'border-transparent text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Icon size={15} /> {en ? s.labelEn : s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* ── 1. Overview ─────────────────────────────────────────────── */}
      <section id="gioi-thieu" className="scroll-mt-32 py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div {...anim('left', 0.05)}>
              <SectionHeading
                eyebrow={en ? 'Overview' : 'Giới thiệu'}
                title={content.gioiThieu.title}
                titleClassName="text-3xl lg:text-[2.5rem]"
              />
              <div className="prose-editorial max-w-none mt-7">
                <p className="whitespace-pre-line">{content.gioiThieu.paragraph1}</p>
                <p className="whitespace-pre-line">{content.gioiThieu.paragraph2}</p>
              </div>
              <div className="grid grid-cols-2 gap-5 mt-9">
                <div className="card-elegant p-6">
                  <div className="font-display font-semibold text-4xl lg:text-5xl text-primary mb-2">{content.gioiThieu.stat1Number}</div>
                  <div className="text-xs uppercase font-montserrat font-semibold text-ink-soft tracking-[0.14em]">{content.gioiThieu.stat1Label}</div>
                </div>
                <div className="card-elegant p-6">
                  <div className="font-display font-semibold text-4xl lg:text-5xl text-secondary mb-2">{content.gioiThieu.stat2Number}</div>
                  <div className="text-xs uppercase font-montserrat font-semibold text-ink-soft tracking-[0.14em]">{content.gioiThieu.stat2Label}</div>
                </div>
              </div>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href={localePath(locale, '/san-pham')} className="btn btn-primary">
                  {en ? 'Our products' : 'Sản phẩm'} <ArrowRight size={16} />
                </Link>
                <Link href={localePath(locale, '/lien-he')} className="btn btn-outline">
                  {en ? 'Contact us' : 'Liên hệ'}
                </Link>
              </div>
            </motion.div>

            <motion.div {...anim('right', 0.15)} className="relative mb-10 lg:mb-0">
              <div className="relative rounded-2xl overflow-hidden border border-line shadow-elegant-lg group">
                <img
                  src="/images/about.webp"
                  alt="binovet"
                  className="w-full h-[360px] lg:h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06243f]/55 via-[#06243f]/10 to-transparent" />
              </div>
              {/* <div className="absolute -bottom-6 left-4 sm:left-8 glass rounded-2xl shadow-elegant-lg px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="font-display font-semibold text-lg text-ink leading-none">GMP–WHO</div>
                  <div className="text-[0.66rem] uppercase font-montserrat font-semibold text-ink-soft tracking-[0.14em] mt-1.5">
                    {en ? 'Factory standard' : 'Tiêu chuẩn nhà máy'}
                  </div>
                </div>
              </div> */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. Vision & Mission (dark centerpiece) ──────────────────── */}
      <section id="tam-nhin" className="scroll-mt-32 py-20 lg:py-28 bg-binovet-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-molecule opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(36rem_36rem_at_85%_-10%,rgba(217,83,31,0.18),transparent_60%),radial-gradient(40rem_40rem_at_0%_120%,rgba(10,77,140,0.45),transparent_55%)] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...anim('down')}>
            <SectionHeading
              theme="dark"
              align="center"
              eyebrow={en ? 'Vision & Mission' : 'Tầm nhìn & Sứ mệnh'}
              title={en ? 'What drives us forward' : 'Kim chỉ nam cho mọi hành động'}
            />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mt-14 max-w-5xl mx-auto">
            <motion.div {...anim('left', 0.05)} className="glass-dark rounded-2xl p-9 lg:p-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-secondary mb-7">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">{content.tamNhin.visionTitle}</h3>
              <p className="text-white/75 leading-relaxed whitespace-pre-line">{content.tamNhin.visionText}</p>
            </motion.div>
            <motion.div {...anim('right', 0.15)} className="glass-dark rounded-2xl p-9 lg:p-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-secondary mb-7">
                <Heart size={28} />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">{content.tamNhin.missionTitle}</h3>
              <p className="text-white/75 leading-relaxed whitespace-pre-line">{content.tamNhin.missionText}</p>
            </motion.div>
          </div>

          {/* Core values */}
          {content.tamNhin.coreValues?.length > 0 && (
            <div className="max-w-5xl mx-auto mt-16 lg:mt-20">
              <motion.div {...anim('down')} className="text-center mb-10">
                <span className="eyebrow eyebrow--center text-secondary justify-center">
                  {content.tamNhin.coreTitle || (en ? 'Core Values' : 'Giá trị cốt lõi')}
                </span>
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                {content.tamNhin.coreValues.map((value, i) => {
                  const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
                  return (
                    <motion.div
                      key={`${value.title}-${i}`}
                      {...anim('up', (i % 3) * 0.1)}
                      className="glass-dark rounded-2xl p-7 lg:p-8 h-full flex flex-col"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-secondary mb-5 shrink-0">
                        <Icon size={24} />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-3 leading-snug">{value.title}</h4>
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{value.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          <motion.div {...anim('up')} className="max-w-3xl mx-auto text-center mt-16">
            <Quote className="w-10 h-10 text-secondary/70 mx-auto mb-5" />
            <p className="font-display text-xl lg:text-2xl text-white leading-relaxed whitespace-pre-line">{content.tamNhin.quoteText}</p>
            <div className="mt-7 flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full glass-dark flex items-center justify-center font-montserrat font-semibold text-xs text-secondary">CEO</div>
              <div className="text-left">
                <div className="font-semibold text-white">{content.tamNhin.quoteAuthor}</div>
                <div className="text-[0.7rem] uppercase font-montserrat font-semibold text-white/55 tracking-[0.14em]">{content.tamNhin.quoteRole}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 4. Facilities ───────────────────────────────────────────── */}
      <section id="co-so" className="scroll-mt-32 py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="">
            <motion.div {...anim('left', 0.05)} className="order-2 lg:order-1">
              <SectionHeading eyebrow={en ? 'Facilities' : 'Cơ sở'} title={content.coSo.title} />
              <div className="prose-editorial max-w-none mt-7">
                <p className="whitespace-pre-line">{content.coSo.intro}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line rounded-2xl overflow-hidden border border-line my-9">
                {content.coSo.stats.map((stat, i) => (
                  <div key={`${stat.label}-${i}`} className="bg-white p-5 lg:p-6 text-center">
                    <div className={`text-4xl lg:text-[2.6rem] font-display font-semibold mb-2 ${i % 2 === 0 ? 'text-primary' : 'text-ink'}`}>{stat.number}</div>
                    <div className="text-[0.66rem] uppercase font-montserrat font-semibold text-ink-soft tracking-[0.12em]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...anim('right', 0.15)} className="order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden border border-line shadow-elegant-lg group aspect-[4/3]">
                <img src="/images/coso.webp" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Nhà máy GMP" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06243f] via-[#06243f]/35 to-transparent flex flex-col justify-end p-8 text-white">
                  <span className="w-12 h-px bg-secondary mb-4" />
                  <h4 className="text-2xl text-white/80 font-semibold mb-2">{content.coSo.cardTitle}</h4>
                  <p className="text-sm text-white/80 whitespace-pre-line">{content.coSo.cardText}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 6. Organisational structure ─────────────────────────────── */}
      <section id="co-cau" className="scroll-mt-32 py-16 lg:py-24 bg-white border-t border-line">
        <div className="container mx-auto px-4">
          <motion.div {...anim('down')}>
            <SectionHeading
              align="center"
              eyebrow={en ? 'Organisation' : 'Tổ chức'}
              title={content.coCau.title}
              subtitle={content.coCau.intro}
            />
          </motion.div>

          <motion.div {...anim('up')} className="flex flex-col items-center mt-14">
            {content.coCau.roles.map((role, i) => {
              const tone = i === 0
                ? 'bg-binovet-dark text-white'
                : i === 1
                  ? 'bg-primary text-white'
                  : 'bg-paper text-ink border border-line';
              return (
                <React.Fragment key={`${role}-${i}`}>
                  {i > 0 && <div className="w-px h-6 bg-line" />}
                  <div className={`w-full ${i < 2 ? 'max-w-xs' : 'max-w-md'} rounded-2xl px-6 py-5 text-center font-montserrat font-semibold uppercase tracking-[0.1em] text-sm shadow-elegant transition-transform duration-300 hover:-translate-y-0.5 ${tone}`}>
                    {role}
                  </div>
                </React.Fragment>
              );
            })}
          </motion.div>

          <motion.div {...anim('up')} className="max-w-4xl mx-auto mt-16">
            <div className="card-elegant bg-cream p-9 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 shrink-0 rounded-2xl bg-white border border-line flex items-center justify-center p-4">
                <img src="/images/logo.png" className="w-full h-full object-contain opacity-70" alt="binovet" />
              </div>
              <div className="relative">
                <Quote className="w-9 h-9 text-secondary/30 mb-3" />
                <p className="font-display text-lg lg:text-xl text-ink leading-relaxed whitespace-pre-line">{content.coCau.quoteText}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Closing CTA ─────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-binovet-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-molecule opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(34rem_34rem_at_80%_-10%,rgba(217,83,31,0.18),transparent_60%),radial-gradient(36rem_36rem_at_0%_120%,rgba(10,77,140,0.42),transparent_55%)] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
          <div className="flex justify-center mb-5">
            <span className="eyebrow eyebrow--center">{en ? 'Partner with us' : 'Hợp tác cùng chúng tôi'}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-semibold text-white">
            {en ? 'Partner with Binovet' : 'Sẵn sàng đồng hành cùng Binovet'}
          </h2>
          <p className="text-white/75 mt-5 leading-relaxed">
            {en
              ? 'Discover our full portfolio of GMP-WHO veterinary solutions, or reach out — our specialists are ready to support you.'
              : 'Khám phá danh mục giải pháp thú y đạt chuẩn GMP-WHO, hoặc liên hệ ngay — đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href={localePath(locale, '/san-pham')} className="btn btn-accent">
              {en ? 'Explore products' : 'Khám phá sản phẩm'} <ArrowRight size={16} />
            </Link>
            <Link href={localePath(locale, '/lien-he')} className="btn btn-ghost-light">
              {en ? 'Contact us' : 'Liên hệ ngay'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
