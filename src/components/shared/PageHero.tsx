import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { localePath, type Locale } from '@/lib/i18n/config';
import Monogram from '@/components/shared/Monogram';

interface Crumb {
  label: string;
  href?: string; // unlocalized path; omit for the current page
}

interface PageHeroProps {
  locale: Locale;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** breadcrumb trail AFTER home (home is prepended automatically) */
  breadcrumb?: Crumb[];
  variant?: 'dark' | 'light';
  align?: 'left' | 'center';
  /** optional background image (rendered faint behind the dark wash) */
  image?: string;
  children?: React.ReactNode;
}

/**
 * Unified inner-page hero — the signature header used on every secondary
 * page (products, news, about, contact…). Establishes a
 * consistent rhythm with a breadcrumb, eyebrow, serif title and the brand
 * molecule motif + monogram watermark. Server-component safe.
 */
export default function PageHero({
  locale,
  eyebrow,
  title,
  subtitle,
  breadcrumb = [],
  variant = 'dark',
  align = 'center',
  image,
  children,
}: PageHeroProps) {
  const dark = variant === 'dark';
  const centered = align === 'center';
  const homeLabel = locale === 'en' ? 'Home' : 'Trang chủ';

  const crumbs: Crumb[] = [{ label: homeLabel, href: '/' }, ...breadcrumb];

  return (
    <section
      className={`relative overflow-hidden ${
        dark ? 'bg-binovet-dark text-white' : 'bg-cream text-ink'
      }`}
    >
      {/* background image (faint) */}
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      )}

      {/* motifs */}
      {dark ? (
        <>
          <div className="absolute inset-0 bg-molecule opacity-70 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(38rem_38rem_at_85%_-20%,rgba(217,83,31,0.20),transparent_60%),radial-gradient(40rem_40rem_at_0%_120%,rgba(10,77,140,0.45),transparent_55%)] pointer-events-none" />
        </>
      ) : (
        <div className="absolute inset-0 bg-dots opacity-50 pointer-events-none" />
      )}

      {/* monogram watermark */}
      <div className="absolute -right-10 top-1/2 -translate-y-1/2 pointer-events-none hidden md:block">
        <Monogram size={320} withText text={locale === 'en' ? 'BINOVET · HIGH-TECH VETERINARY · ' : undefined} tone={dark ? 'light' : 'brand'} className={dark ? 'opacity-[0.09]' : 'opacity-[0.07]'} />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-16 lg:py-24">
        {/* breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className={`flex items-center flex-wrap gap-1.5 text-[0.72rem] font-montserrat font-semibold uppercase tracking-[0.18em] mb-8 ${
            centered ? 'justify-center' : ''
          } ${dark ? 'text-white/55' : 'text-ink-soft/70'}`}
        >
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <React.Fragment key={`${c.label}-${i}`}>
                {c.href && !last ? (
                  <Link
                    href={localePath(locale, c.href)}
                    className={`transition-colors ${dark ? 'hover:text-secondary' : 'hover:text-primary'}`}
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className={dark ? 'text-secondary' : 'text-primary'}>{c.label}</span>
                )}
                {!last && <ChevronRight size={12} className="opacity-50" />}
              </React.Fragment>
            );
          })}
        </nav>

        <div className={centered ? 'max-w-3xl mx-auto text-center' : 'max-w-3xl'}>
          {eyebrow && (
            <span className={`eyebrow ${centered ? 'eyebrow--center' : ''} mb-5`}>{eyebrow}</span>
          )}
          <h1
            className={`font-display font-semibold leading-[1.08] tracking-tight text-4xl md:text-5xl lg:text-6xl ${
              dark ? 'text-white!' : 'text-ink!'
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`mt-6 text-lg leading-relaxed ${centered ? 'mx-auto' : ''} max-w-2xl ${
                dark ? 'text-white/75' : 'text-ink-soft'
              }`}
            >
              {subtitle}
            </p>
          )}

          <div className={`divider-diamond mt-8 ${centered ? '' : 'justify-start [&::before]:hidden'}`}>
            <span />
          </div>

          {children}
        </div>
      </div>

      {/* bottom hairline */}
      <div className={`absolute bottom-0 left-0 right-0 h-px ${dark ? 'bg-white/10' : 'bg-line'}`} />
    </section>
  );
}
