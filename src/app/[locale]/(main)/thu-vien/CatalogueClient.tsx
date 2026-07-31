'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const PdfFlipbook = dynamic(() => import('@/components/ui/PdfFlipbook'), {
  ssr: false,
});

interface DocumentInfo {
  title: string;
  titleEn: string;
  size: string;
  type: string;
  link: string;
}

const isHtmlDocumentLink = (url: string) => {
  if (!url) return false;
  try {
    const normalized = url.toLowerCase();
    return (
      normalized.includes('.html') ||
      normalized.includes('/flip-book/') ||
      normalized.includes('heyzine.com') ||
      normalized.includes('viewer.html')
    );
  } catch {
    return false;
  }
};

// Cố gắng tải file thật (kể cả link html) bằng fetch + blob.
// Nếu bị chặn CORS (thường gặp với link ngoài như heyzine.com) thì fallback mở tab mới.
async function forceDownload(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('fetch failed');
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export default function DocumentList({
  documents,
  locale = 'vi',
}: {
  documents: DocumentInfo[];
  locale?: 'vi' | 'en';
}) {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const isEn = locale === 'en';

  useEffect(() => {
    if (selectedPdf) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPdf]);

  const handleDownload = async (doc: DocumentInfo) => {
    const isHtmlLink = isHtmlDocumentLink(doc.link);
    if (!isHtmlLink) return;

    setDownloadingKey(doc.link);
    const ext = doc.link.split('?')[0].split('.').pop() || 'html';
    const filename = `${(isEn ? doc.titleEn : doc.title) || 'document'}.${ext}`;
    await forceDownload(doc.link, filename);
    setDownloadingKey(null);
  };

  return (
    <>
      <div className="space-y-6">
        {documents.map((doc) => {
          const isHtmlLink = isHtmlDocumentLink(doc.link);
          const isDownloading = downloadingKey === doc.link;

          return (
            <div
              key={doc.title}
              className="flex flex-col md:flex-row items-center gap-6 p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                <FileText size={32} />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-black text-biotechvet-dark mb-1">
                  {isEn ? doc.titleEn : doc.title}
                </h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center md:justify-start gap-3">
                  {doc.type} • {doc.size}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 md:gap-4 w-full md:w-auto">
                <button
                  onClick={() => {
                    if (isHtmlLink) {
                      window.open(doc.link, '_blank', 'noopener,noreferrer');
                      return;
                    }
                    setSelectedPdf(doc.link);
                  }}
                  className="flex items-center justify-center flex-1 md:flex-initial gap-2 bg-biotechvet-alt text-primary font-black py-3 px-6 rounded-full text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                >
                  <Eye size={16} /> {isEn ? 'View' : 'Xem'}
                </button>

                {isHtmlLink ? (
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={isDownloading}
                    className="flex items-center justify-center flex-1 md:flex-initial gap-2 bg-primary text-white font-black py-3 px-6 rounded-full text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
                  >
                    {isDownloading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    {isEn ? 'Download' : 'Tải về'}
                  </button>
                ) : (
                  <a
                    href={doc.link}
                    download
                    className="flex items-center justify-center flex-1 md:flex-initial gap-2 bg-primary text-white font-black py-3 px-6 rounded-full text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                  >
                    <Download size={16} /> {isEn ? 'Download' : 'Tải về'}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPdf && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 lg:p-10 animate-in fade-in zoom-in-95 duration-300"
          onClick={() => setSelectedPdf(null)}
        >
          <div
            className="w-full h-full max-w-[1400px] relative mx-auto flex flex-col shadow-2xl rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <PdfFlipbook url={selectedPdf} onClose={() => setSelectedPdf(null)} />
          </div>
        </div>
      )}
    </>
  );
}