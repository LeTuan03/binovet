"use client";

import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { useLocale } from '@/lib/i18n/LocaleProvider';

interface ProductGalleryProps {
  mainImage: string;
  images?: string[];
  alt: string;
}

export default function ProductGallery({ mainImage, images = [], alt }: ProductGalleryProps) {
  const { locale } = useLocale();
  const closeLabel = locale === 'en' ? 'Close' : 'Đóng';
  const [activeImage, setActiveImage] = useState(mainImage);
  const [isOpen, setIsOpen] = useState(false);

  const allImages = [mainImage, ...images.filter(Boolean)];

  return (
    <>
      {/* Main Image Display */}
      <div className="w-full space-y-5">
        <button
          type="button"
          className="relative group cursor-zoom-in rounded-2xl overflow-hidden flex items-center justify-center w-full"
          onClick={() => setIsOpen(true)}
          aria-label={alt}
        >
          <img
            src={activeImage}
            alt={alt}
            className="max-h-[52vh] w-auto object-contain transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-primary text-white p-3 rounded-full shadow-elegant translate-y-3 group-hover:translate-y-0 transition-transform">
              <ZoomIn size={22} />
            </span>
          </span>
        </button>

        {/* Thumbnail Strip */}
        {allImages.length > 1 && (
          <div className="flex gap-3 flex-wrap justify-center">
            {allImages.map((img, index) => (
              <button
                key={`thumb-${index}`}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border bg-white p-1.5 transition-all duration-300 cursor-pointer ${
                  activeImage === img
                    ? 'border-primary/40 ring-2 ring-primary/30 shadow-elegant'
                    : 'border-line hover:border-primary/40 opacity-70 hover:opacity-100'
                }`}
                aria-label={`${alt} ${index + 1}`}
              >
                <img
                  src={img}
                  alt={`${alt} - ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 animate-fade-in">
          <div
            className="absolute inset-0 bg-[#06243f]/80 backdrop-blur-md cursor-zoom-out"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="relative z-10 w-full max-w-5xl max-h-full flex flex-col items-center justify-center bg-white rounded-2xl overflow-hidden shadow-float">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-paper text-ink-soft hover:bg-secondary/10 hover:text-secondary border border-line transition-colors"
              title={closeLabel}
              aria-label={closeLabel}
            >
              <X size={20} />
            </button>
            <div className="p-8 w-full h-[70vh] flex items-center justify-center">
              <img
                src={activeImage}
                alt={alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Lightbox Thumbnails */}
            {allImages.length > 1 && (
              <div className="w-full px-8 pb-4 flex gap-2.5 justify-center flex-wrap">
                {allImages.map((img, index) => (
                  <button
                    key={`lb-thumb-${index}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage(img);
                    }}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border bg-white p-1 transition-all duration-300 cursor-pointer ${
                      activeImage === img
                        ? 'border-primary/40 ring-2 ring-primary/30'
                        : 'border-line hover:border-primary/40 opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`${alt} ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${alt} - ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="w-full p-4 text-center font-montserrat font-semibold text-sm tracking-wide text-ink border-t border-line bg-paper">
              {alt}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
