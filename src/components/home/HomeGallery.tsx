"use client";

import React, { useState } from 'react';
import { X, ZoomIn, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeading from '@/components/shared/SectionHeading';

interface HomeGalleryProps {
  readonly images: Array<{ id: string | number; url: string; title?: string; status?: string }>;
  readonly videos: Array<{ id: string | number; url: string; title?: string; thumbnail?: string; status?: string }>;
  readonly youtubeUrl?: string;
}

export default function HomeGallery({ images, videos, youtubeUrl }: HomeGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const featuredVideo = videos?.[0];

  const getAspectClass = (index: number) => {
    if (index % 3 === 0) return 'aspect-[3/4]';
    if (index % 3 === 1) return 'aspect-square';
    return 'aspect-[4/3]';
  };

  const handleKeyPress = (event: React.KeyboardEvent, item: any) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedItem({ ...item, type: item.url?.includes('.mp4') ? 'video' : 'image' });
    }
  };

  return (
    <section className="py-24 lg:py-28 bg-white">
      <div className="container mx-auto px-4">
        <SectionHeading
          align="center"
          divider
          eyebrow="Thư viện"
          title="Video &"
          accent="Hình ảnh"
          subtitle="Khám phá quy mô nhà máy và các hoạt động nổi bật của BINOVET"
          className="mb-16"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Video Feature */}
          <div className="flex flex-col gap-6">
             <button
               type="button"
               className="group relative aspect-video rounded-2xl overflow-hidden border border-line shadow-elegant-lg ring-1 ring-line/60 cursor-pointer"
               onClick={() => featuredVideo && setSelectedItem({ ...featuredVideo, type: 'video' })}
               disabled={!featuredVideo}
             >
                <img
                  src={featuredVideo?.thumbnail || '/images/about.svg'}
                  alt="Video cover"
                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06243f]/85 via-[#06243f]/20 to-transparent group-hover:from-[#06243f]/75 transition-all flex items-center justify-center">
                   <div className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-float group-hover:scale-110 group-hover:bg-secondary/90 group-hover:border-secondary transition-all duration-300">
                      <PlayCircle size={54} strokeWidth={1.5} className="text-white" />
                   </div>
                </div>
                <div className="absolute bottom-7 left-7 right-7 text-left">
                   <div className="eyebrow text-secondary mb-3">Featured Video</div>
                   <h3 className="font-display text-2xl font-semibold text-white leading-snug">{featuredVideo?.title || 'Phim giới thiệu BINOVET'}</h3>
                </div>
             </button>
             <div className="card-elegant p-7 flex items-center justify-between gap-5">
                <div>
                   <h4 className="font-display font-semibold text-ink text-lg mb-1">Kênh YouTube chính thức</h4>
                   <p className="text-ink-soft text-sm">Cập nhật kỹ thuật chăn nuôi hàng tuần</p>
                </div>
                <a href={youtubeUrl || 'https://www.youtube.com/@Biotech-VET'} target="_blank" className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center hover:bg-secondary hover:text-white transition-all shrink-0">
                   <PlayCircle size={26} strokeWidth={1.75} />
                </a>
             </div>
          </div>

          {/* Masonry-style Grid */}
          <div className="columns-2 gap-6 space-y-6">
            {images.map((img, i) => (
              <div
                key={img.id}
                className={`relative group rounded-2xl overflow-hidden border border-line shadow-elegant cursor-pointer break-inside-avoid ${getAspectClass(i)}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedItem({ ...img, type: 'image' })}
                onKeyDown={(event) => handleKeyPress(event, img)}
              >
                <img
                  src={img.url}
                  alt={img.title || ''}
                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  className="transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06243f]/85 via-[#06243f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                   <div className="bg-secondary/90 text-white p-2.5 rounded-xl w-fit mb-3 transform -translate-y-4 group-hover:translate-y-0 transition-transform">
                      <ZoomIn size={18} />
                   </div>
                   <p className="text-white font-display font-semibold text-sm leading-tight line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox / Video Player */}
      <AnimatePresence>
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-12"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#06243f]/80 backdrop-blur cursor-pointer"
            onClick={() => setSelectedItem(null)}
            aria-label="Close media viewer"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-float ring-1 ring-white/10"
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 bg-paper hover:bg-secondary/10 text-ink-soft hover:text-secondary w-12 h-12 rounded-full flex items-center justify-center transition-all z-20 border border-line"
            >
              <X size={22} />
            </button>

            <div className="flex flex-col md:flex-row h-full">
               <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-[500px]">
                  {selectedItem.type === 'video' ? (
                    <video
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                    >
                      <source src={selectedItem.url} type="video/mp4" />
                      <track kind="captions" srcLang="vi" src="/empty-captions.vtt" label="Vietnamese captions" default />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  ) : (
                    <img
                      src={selectedItem.url}
                      alt={selectedItem.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
               </div>
               <div className="w-full md:w-80 bg-white p-10 flex flex-col justify-center">
                  <div className="eyebrow text-secondary mb-4">
                     {selectedItem.type === 'video' ? 'Video giới thiệu' : 'Hình ảnh thư viện'}
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-ink leading-snug mb-6">
                    {selectedItem.title}
                  </h3>
                  <p className="text-ink-soft text-sm leading-relaxed mb-10">
                    Nội dung trực thuộc thư viện truyền thông chính thức của BINOVET.
                  </p>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="btn btn-outline mt-auto justify-center"
                  >
                    <X size={16} /> Đóng cửa sổ
                  </button>
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </section>
  );
}
