'use client';

import React, { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, X, Loader2, BookOpen } from 'lucide-react';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ─── PageLayer ─────────────────────────────────────────────────────────────────
// side: "left"  → spine shadow trên cạnh PHẢI
//       "right" → spine shadow trên cạnh TRÁI
const PageLayer = forwardRef(
  (
    {
      pageNumber,
      width,
      height,
      side,
    }: { pageNumber: number; width: number; height: number; side?: 'left' | 'right' },
    ref: React.Ref<HTMLDivElement>
  ) => {
    const isLeft = side === 'left';

    return (
      <div
        ref={ref}
        style={{ width, height, position: 'relative', overflow: 'hidden', backgroundColor: '#fff' }}
      >
        <Page
          pageNumber={pageNumber}
          width={width}
          renderTextLayer
          renderAnnotationLayer
          loading={
            <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 className="animate-spin" size={24} style={{ color: '#D2A050' }} />
            </div>
          }
        />

        {/* Outer-edge vignette (nhạt) */}
        <div
          style={{
            position: 'absolute', top: 0, bottom: 0,
            [isLeft ? 'left' : 'right']: 0,
            width: 20,
            background: isLeft
              ? 'linear-gradient(to right, rgba(0,0,0,0.07), transparent)'
              : 'linear-gradient(to left,  rgba(0,0,0,0.07), transparent)',
            pointerEvents: 'none', zIndex: 5,
          }}
        />

        {/* Spine shadow (đậm, phía gáy) */}
        <div
          style={{
            position: 'absolute', top: 0, bottom: 0,
            [isLeft ? 'right' : 'left']: 0,
            width: 36,
            background: isLeft
              ? 'linear-gradient(to left,  rgba(0,0,0,0.22), transparent)'
              : 'linear-gradient(to right, rgba(0,0,0,0.22), transparent)',
            pointerEvents: 'none', zIndex: 5,
          }}
        />

        {/* Số trang */}
        <div
          style={{
            position: 'absolute', bottom: 10,
            [isLeft ? 'left' : 'right']: 14,
            fontSize: 10, color: '#bbb',
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.12em', userSelect: 'none', zIndex: 10,
          }}
        >
          {pageNumber}
        </div>
      </div>
    );
  }
);
PageLayer.displayName = 'PageLayer';

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function PdfFlipbook({ url, onClose }: { url: string; onClose: () => void }) {
  const [numPages, setNumPages]     = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 1100, height: 600 });
  const [isLoaded, setIsLoaded]     = useState(false);
  const bookRef   = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setTimeout(() => setIsLoaded(true), 300);
  }

  useEffect(() => {
    const update = () => {
      if (wrapperRef.current) {
        setContainerSize({
          width: wrapperRef.current.clientWidth,
          height: wrapperRef.current.clientHeight,
        });
      }
    };
    update();
    setTimeout(update, 100);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  let targetPageWidth = (containerSize.width - 160) / 2;
  let targetPageHeight = targetPageWidth * 1.414;

  if (targetPageHeight > containerSize.height) {
    targetPageHeight = containerSize.height;
    targetPageWidth = targetPageHeight / 1.414;
  }

  const pageWidth = Math.max(Math.floor(targetPageWidth), 180);
  const pageHeight = Math.floor(pageWidth * 1.414);

  const onFlip = useCallback((e: any) => setCurrentPage(e.data + 1), []);

  // showCover=false → index chẵn = trang trái, lẻ = trang phải
  const getSide = (index: number): 'left' | 'right' => (index % 2 === 0 ? 'left' : 'right');

  const progress = numPages
    ? Math.round(((currentPage - 1) / Math.max(numPages - 1, 1)) * 100)
    : 0;

  const NavBtn = ({
    onClick, dir, children,
  }: { onClick: () => void; dir: 'left' | 'right'; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className="hidden md:flex w-11 h-11 rounded-full items-center justify-center transition-all duration-200"
      style={{
        flexShrink: 0,
        background: 'rgba(210,160,80,0.13)',
        border: '1px solid rgba(210,160,80,0.28)',
        color: '#D2A050',
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
      }}
      onMouseEnter={e =>
        Object.assign((e.currentTarget as HTMLElement).style, {
          background: 'rgba(210,160,80,0.26)',
          transform: `translateX(${dir === 'left' ? '-2px' : '2px'})`,
        })
      }
      onMouseLeave={e =>
        Object.assign((e.currentTarget as HTMLElement).style, {
          background: 'rgba(210,160,80,0.13)',
          transform: 'translateX(0)',
        })
      }
    >
      {children}
    </button>
  );

  return (
    <div
      className="w-full h-full flex flex-col rounded-3xl overflow-hidden bg-biotechvet-dark relative"
      style={{
        boxShadow: '0 40px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* Top glow */}
      <div className="absolute inset-x-0 top-0 h-72 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(210,160,80,0.15) 0%, transparent 65%)' }} />

      {/* ── HEADER ── */}
      <div
        className="relative flex items-center justify-between px-5 md:px-7 py-3 md:py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(210,160,80,0.13)' }}
      >
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(210,160,80,0.14)', border: '1px solid rgba(210,160,80,0.28)' }}>
            <BookOpen size={16} style={{ color: '#D2A050' }} />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase mb-0.5"
              style={{ color: 'rgba(210,160,80,0.55)', fontFamily: 'Helvetica Neue, sans-serif' }}>
              Catalogue
            </p>
            <h3 className="text-white font-bold text-sm leading-none">Sách Catalogue</h3>
          </div>
        </div>

        {/* Page counter */}
        {numPages && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5"
            style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
            <span className="text-sm tabular-nums font-semibold" style={{ color: '#D2A050' }}>
              {currentPage}
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
            <span className="text-sm tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {numPages}
            </span>
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.45)',
          }}
          onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(220,60,60,0.2)', color: '#ff7070' })}
          onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' })}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── STAGE ── */}
      <div
        ref={wrapperRef}
        className="relative flex-1 flex justify-center items-center gap-2 md:gap-4 px-2 md:px-6 py-4 overflow-hidden"
      >
        {/* Desk glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: pageWidth * 2.6, height: 90,
            background: 'radial-gradient(ellipse, rgba(210,160,80,0.1) 0%, transparent 70%)',
          }} />

        <NavBtn onClick={() => bookRef.current?.pageFlip()?.flipPrev()} dir="left">
          <ChevronLeft size={20} />
        </NavBtn>

        {/* Book wrapper */}
        <div
          className="relative transition-all duration-700"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.97)',
            filter: 'drop-shadow(0 28px 55px rgba(0,0,0,0.75)) drop-shadow(0 8px 16px rgba(0,0,0,0.45))',
          }}
        >
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center"
                style={{ width: pageWidth * 2, height: pageHeight }}>
                <Loader2 size={34} className="animate-spin mb-4" style={{ color: '#D2A050' }} />
                <p className="text-sm tracking-widest uppercase"
                  style={{ color: 'rgba(210,160,80,0.55)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                  Đang tải sách…
                </p>
              </div>
            }
            error={
              <p className="text-red-400 text-sm py-20">Không thể tải được PDF.</p>
            }
          >
            {numPages && (
              <>
                <HTMLFlipBook
                  width={pageWidth}
                  height={pageHeight}
                  size="fixed"
                  maxShadowOpacity={0.55}
                  showCover={false}    // ← luôn hiển thị đôi trang
                  usePortrait={false}  // ← bắt buộc chế độ double-page
                  mobileScrollSupport={true}
                  onFlip={onFlip}
                  ref={bookRef}
                  className="flipbook-wrapper"
                  style={{ margin: '0 auto', display: 'block' }}
                >
                  {Array.from({ length: numPages }, (_, i) => (
                    <PageLayer
                      key={`page_${i + 1}`}
                      pageNumber={i + 1}
                      width={pageWidth}
                      height={pageHeight}
                      side={getSide(i)}
                    />
                  ))}
                </HTMLFlipBook>

                {/* Gáy sách ở giữa */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0, bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    background:
                      'linear-gradient(to bottom, rgba(20,10,3,0.7) 0%, rgba(70,35,8,0.55) 50%, rgba(20,10,3,0.7) 100%)',
                    boxShadow: '0 0 10px rgba(0,0,0,0.6)',
                    pointerEvents: 'none',
                    zIndex: 20,
                  }}
                />
              </>
            )}
          </Document>
        </div>

        <NavBtn onClick={() => bookRef.current?.pageFlip()?.flipNext()} dir="right">
          <ChevronRight size={20} />
        </NavBtn>
      </div>

      {/* ── FOOTER ── */}
      <div className="px-6 md:px-8 pb-4 flex-shrink-0 flex flex-col gap-3">
        <div className="w-full rounded-full overflow-hidden" style={{ height: 2, background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, rgba(210,160,80,0.45), #D2A050)',
            }}
          />
        </div>
        <p className="text-center text-xs tracking-wider"
          style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'Helvetica Neue, sans-serif' }}>
          Nhấp vào góc trang · kéo · hoặc dùng nút mũi tên để lật trang
        </p>
      </div>
    </div>
  );
}