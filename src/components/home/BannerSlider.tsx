"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BannerSliderProps {
  readonly banners: Array<{ id: string | number; image: string; title?: string; order?: number }>;
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const count = banners?.length ?? 0;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? count - 1 : prev - 1));
  };

  // Gentle auto-advance
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(nextSlide, 6000);
    return () => clearInterval(id);
  }, [count, nextSlide, currentSlide]);

  if (!banners || banners.length === 0) {
    return (
      <section className="w-full min-h-[300px] md:min-h-[400px] bg-binovet-dark bg-molecule flex items-center justify-center text-white/70 font-montserrat font-semibold uppercase tracking-[0.3em] text-sm animate-pulse">
        BINOVET
      </section>
    );
  }

  return (
    <section className="relative w-full bg-binovet-dark overflow-hidden h-[180px] md:h-[420px] lg:h-[620px] group/banner">
      <AnimatePresence initial={false}>
        {banners.map((slide, index) => {
          if (index !== currentSlide) return null;

          return (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              {/* Ken Burns intro — the slide enters zoomed-in and slowly
                  eases back to its natural size for a cinematic reveal. */}
              <motion.img
                src={slide.image}
                alt={slide.title || 'Banner'}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                initial={{ scale: 1.18 }}
                animate={{ scale: 1 }}
                transition={{ duration: 7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover block will-change-transform"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* subtle edge vignette for premium depth */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(6,36,63,0.22)_0%,transparent_24%,transparent_70%,rgba(6,36,63,0.38)_100%)]" />

      {/* Prev / Next */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-sm transition-all opacity-0 group-hover/banner:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-sm transition-all opacity-0 group-hover/banner:opacity-100"
      >
        <ChevronRight size={20} />
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-5 lg:bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
        {banners.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide ? 'w-8 bg-secondary' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
