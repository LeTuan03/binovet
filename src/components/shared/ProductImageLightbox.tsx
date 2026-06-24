"use client";

import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ProductImageLightboxProps {
  src: string;
  alt: string;
}

export default function ProductImageLightbox({ src, alt }: ProductImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="relative group cursor-zoom-in flex items-center justify-center"
        onClick={() => setIsOpen(true)}
        aria-label={alt}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[50vh] w-auto object-contain transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-primary text-white p-3 rounded-full shadow-elegant translate-y-3 group-hover:translate-y-0 transition-transform">
            <ZoomIn size={22} />
          </span>
        </span>
      </button>

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
              title="Đóng"
              aria-label="Đóng"
            >
              <X size={20} />
            </button>
            <div className="p-8 w-full h-[70vh] flex items-center justify-center">
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="w-full p-4 text-center font-montserrat font-semibold text-sm tracking-wide text-ink border-t border-line bg-paper">
              {alt}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
