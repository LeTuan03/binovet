"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, MousePointerClick } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroBanner {
  id: string | number;
  image: string;
  title?: string;
  ctaHref?: string;
  order?: number;
}

interface BannerSliderProps {
  readonly banners: ReadonlyArray<HeroBanner>;
  /** Fixed editorial overlay copy (same across all slides). */
  readonly eyebrow?: string;
  readonly subtitle?: string;
  readonly ctaLabel?: string;
  readonly secondaryLabel?: string;
  readonly secondaryHref?: string;
  readonly scrollLabel?: string;
  /** Fallback headline used when a slide has no title / there are no slides. */
  readonly fallbackTitle?: string;
}

const AUTO_MS = 6500;

export default function BannerSlider({
  banners,
  eyebrow = 'BIOTECH-VET',
  subtitle,
  ctaLabel = 'Khám phá',
  secondaryLabel,
  secondaryHref = '#',
  scrollLabel = 'Cuộn xuống',
  fallbackTitle = 'BINOVET',
}: BannerSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Always render at least one slide so the editorial hero never collapses.
  const slides: HeroBanner[] = banners && banners.length > 0
    ? [...banners]
    : [{ id: 'fallback', image: '/images/about.svg', title: fallbackTitle, ctaHref: secondaryHref }];
  const count = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? count - 1 : prev - 1));
  };

  // Gentle auto-advance
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(nextSlide, AUTO_MS);
    return () => clearInterval(id);
  }, [count, nextSlide, currentSlide]);

  const active = slides[currentSlide];
  const headline = active?.title || fallbackTitle;
  const primaryHref = active?.ctaHref || secondaryHref;

  return (
    <section className="relative w-full bg-binovet-dark overflow-hidden h-[88vh] min-h-[560px] max-h-[940px] group/banner">
      {/* ── Cinematic imagery (Ken Burns) ─────────────────────────────── */}
      <AnimatePresence initial={false}>
        {slides.map((slide, index) => {
          if (index !== currentSlide) return null;
          return (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              <motion.img
                src={slide.image}
                alt={slide.title || 'Banner'}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                initial={{ scale: 1.16 }}
                animate={{ scale: 1 }}
                transition={{ duration: 8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover block will-change-transform"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ── Legibility scrims (directional, layered) ──────────────────── */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(95deg,rgba(4,20,38,0.92)_0%,rgba(5,28,51,0.74)_34%,rgba(6,36,63,0.30)_62%,rgba(6,36,63,0.08)_100%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(0deg,rgba(4,20,38,0.78)_0%,transparent_38%,transparent_72%,rgba(4,20,38,0.28)_100%)]" />
      <div className="absolute inset-0 pointer-events-none bg-molecule opacity-[0.5] mix-blend-soft-light" />

      {/* ── Editorial overlay ─────────────────────────────────────────── */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-[44rem]">
            {/* eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="flex items-center gap-3.5 mb-7"
            >
              <span className="h-px w-10 bg-secondary" />
              <span className="font-montserrat text-[0.7rem] md:text-[0.74rem] font-bold uppercase tracking-[0.34em] text-white/85">
                {eyebrow}
              </span>
            </motion.div>

            {/* per-slide headline */}
            <div className="min-h-[7.5rem] sm:min-h-[9rem] lg:min-h-[12.5rem]">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={currentSlide}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display font-semibold text-white leading-[1.06] tracking-tight hero-text-shadow text-[2.35rem] sm:text-5xl lg:text-[4.1rem]"
                >
                  {headline}
                </motion.h1>
              </AnimatePresence>
            </div>

            {/* subtitle */}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12, ease: 'easeOut' }}
                className="mt-6 max-w-xl text-base lg:text-[1.075rem] leading-relaxed text-white/80"
              >
                {subtitle}
              </motion.p>
            )}

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22, ease: 'easeOut' }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link href={primaryHref} className="btn btn-accent">
                {ctaLabel} <ArrowRight size={16} />
              </Link>
              {secondaryLabel && (
                <Link href={secondaryHref} className="btn btn-ghost-light">
                  {secondaryLabel} <ArrowUpRight size={16} />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Side arrows (reveal on hover) ─────────────────────────────── */}
      {count > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full hidden md:flex items-center justify-center text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-sm transition-all opacity-0 group-hover/banner:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full hidden md:flex items-center justify-center text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-sm transition-all opacity-0 group-hover/banner:opacity-100"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* ── Bottom bar: counter + progress + scroll cue ───────────────── */}
      {/* Sits high enough to clear the floating credential strip below the hero. */}
      <div className="absolute bottom-0 inset-x-0 z-30 pb-16 lg:pb-20">
        <div className="container mx-auto px-4 flex items-end justify-between gap-6">
          {/* slide counter + progress */}
          <div className="flex items-center gap-5">
            <div className="flex items-baseline gap-1.5 font-display text-white">
              <span className="text-2xl lg:text-3xl font-semibold leading-none">
                {String(currentSlide + 1).padStart(2, '0')}
              </span>
              <span className="text-white/45 text-sm">/ {String(count).padStart(2, '0')}</span>
            </div>
            <div className="relative h-px w-28 lg:w-44 bg-white/25 overflow-hidden">
              <motion.span
                key={currentSlide}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: count > 1 ? 1 : 0.001 }}
                transition={{ duration: AUTO_MS / 1000, ease: 'linear' }}
                className="absolute inset-0 origin-left bg-secondary"
              />
            </div>
            {count > 1 && (
              <div className="hidden sm:flex items-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === currentSlide ? 'w-6 bg-secondary' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* scroll cue */}
          <div className="hidden md:flex items-center gap-3 text-white/65">
            <span className="font-montserrat text-[0.62rem] font-semibold uppercase tracking-[0.28em]">
              {scrollLabel}
            </span>
            <motion.span
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/30"
            >
              <MousePointerClick size={15} />
            </motion.span>
          </div>
        </div>
      </div>
    </section>
  );
}
