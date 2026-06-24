"use client";

import React, { useState } from 'react';
import { X, ZoomIn, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GalleryItem {
  id: string | number;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  title?: string;
}

interface GalleryGridProps {
  readonly items: GalleryItem[];
  readonly emptyText?: string;
}

/**
 * Uniform 3-column media gallery (images + videos) with a caption bar under
 * each card and a lightbox / inline player — the Slide Gallery page content.
 */
export default function GalleryGrid({ items, emptyText = 'Chưa có nội dung.' }: GalleryGridProps) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="py-24 text-center bg-paper rounded-3xl border border-dashed border-line">
        <ZoomIn size={48} className="mx-auto text-gray-300 mb-5" />
        <p className="text-ink-soft font-montserrat font-semibold uppercase tracking-[0.18em] text-sm">{emptyText}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item)}
            className="card-elegant overflow-hidden group flex flex-col text-left"
          >
            <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
              <img
                src={item.thumbnail}
                alt={item.title || ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                className="transition-transform duration-700 group-hover:scale-105"
              />
              <div className={`absolute inset-0 flex items-center justify-center transition-all ${item.type === 'video' ? 'bg-binovet-dark/35 group-hover:bg-binovet-dark/20' : 'bg-binovet-dark/0 group-hover:bg-binovet-dark/15'}`}>
                {item.type === 'video' ? (
                  <span className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                    <PlayCircle size={40} />
                  </span>
                ) : (
                  <span className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all">
                    <ZoomIn size={20} />
                  </span>
                )}
              </div>
            </div>
            <div className="bg-paper px-5 py-4 text-center border-t border-line flex-1 flex items-center justify-center">
              <h3 className="font-display font-semibold text-ink text-[0.95rem] leading-snug line-clamp-2">{item.title || '—'}</h3>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-12"
          >
            <button
              type="button"
              className="absolute inset-0 bg-binovet-dark/95 cursor-pointer"
              onClick={() => setSelected(null)}
              aria-label="Close"
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="relative z-10 w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white flex items-center justify-center transition-all"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              {selected.type === 'video' ? (
                <video className="w-full h-full aspect-video bg-black" controls autoPlay>
                  <source src={selected.url} type="video/mp4" />
                  <track kind="captions" srcLang="vi" src="/empty-captions.vtt" label="Vietnamese captions" default />
                </video>
              ) : (
                <img src={selected.url} alt={selected.title || ''} className="w-full max-h-[85vh] object-contain bg-black" />
              )}
              {selected.title && (
                <div className="bg-white px-6 py-4 text-center">
                  <h3 className="font-display font-semibold text-ink">{selected.title}</h3>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
