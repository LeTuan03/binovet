"use client";

import React, { useState } from 'react';
import { PlayCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroVideoProps {
  readonly video?: { url?: string; thumbnail?: string; title?: string } | null;
  readonly youtubeUrl?: string;
  readonly poster?: string;
  readonly label?: string;
}

/**
 * Brand-intro video tile used in the homepage company-introduction section
 * (sanfovet-style). Shows a poster with a play button; clicking plays an
 * inline mp4 in a lightbox, or opens the YouTube channel if no inline file.
 */
export default function IntroVideo({ video, youtubeUrl, poster, label = 'Phim giới thiệu' }: IntroVideoProps) {
  const [open, setOpen] = useState(false);
  const thumb = video?.thumbnail || poster || '/images/about.svg';
  const hasInline = Boolean(video?.url);

  const handleOpen = () => {
    if (hasInline) setOpen(true);
    else if (youtubeUrl) window.open(youtubeUrl, '_blank', 'noopener');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="group relative block w-full aspect-video rounded-2xl overflow-hidden border border-line shadow-elegant-lg ring-1 ring-line/60"
      >
        <img
          src={thumb}
          alt={video?.title || label}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          className="transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06243f]/85 via-[#06243f]/20 to-transparent group-hover:from-[#06243f]/75 transition-all flex items-center justify-center">
          <span className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-float group-hover:scale-110 group-hover:bg-secondary/90 group-hover:border-secondary transition-all duration-300">
            <PlayCircle size={52} strokeWidth={1.5} className="text-white" />
          </span>
        </div>
        <div className="absolute bottom-6 left-6 right-6 text-left">
          <span className="eyebrow text-secondary mb-2">{label}</span>
          {video?.title && (
            <h3 className="font-display text-xl font-semibold text-white leading-snug line-clamp-2">{video.title}</h3>
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && hasInline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10"
          >
            <button
              type="button"
              className="absolute inset-0 bg-[#06243f]/80 backdrop-blur cursor-pointer"
              onClick={() => setOpen(false)}
              aria-label="Close video"
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="relative z-10 w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-float ring-1 ring-white/10"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white flex items-center justify-center transition-all"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <video className="w-full h-full aspect-video" controls autoPlay>
                <source src={video?.url} type="video/mp4" />
                <track kind="captions" srcLang="vi" src="/empty-captions.vtt" label="Vietnamese captions" default />
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
