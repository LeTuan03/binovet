"use client";

import { useState, useEffect } from 'react';
import { Phone, Mail, MessageSquare, X, Send, Globe, MapPin } from 'lucide-react';
import Link from 'next/link';
import Monogram from '@/components/shared/Monogram';

export default function FloatingContact({ settings }: { settings: any }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setShowBackToTop(window.scrollY > 300);
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="floating-contact hidden md:flex fixed bottom-6 right-6 flex-col gap-3 z-[999]" suppressHydrationWarning>
        <a 
          href="tel:0974999204" 
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 bg-gradient-to-br from-[#e53935] to-[#c62828] animate-bounce-slow"
          title="Gọi hotline"
        >
          <Phone size={22} />
        </a>
        <a 
          href={`mailto:${settings?.support?.doctorEmail}`} 
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 bg-gradient-to-br from-accent to-[#e65100]"
          title="Gửi email"
        >
          <Mail size={22} />
        </a>
        <a 
          href={`https://zalo.me/${settings?.social?.zalo}`} 
          target="_blank" 
          rel="noopener"
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 bg-gradient-to-br from-[#0068ff] to-[#0052cc]"
          title="Chat Zalo"
        >
          <span className="text-[0.7rem] font-bold">Zalo</span>
        </a>
        <a 
          href={settings?.social?.facebook || 'https://www.facebook.com/BiotechVietNam1'}
          target="_blank" 
          rel="noopener"
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 bg-gradient-to-br from-[#1877f2] to-[#0d47a1]"
          title="Facebook"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <button 
          onClick={() => setIsPopupOpen(true)}
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 bg-gradient-to-br from-primary to-primary-dark"
          title="Liên hệ nhanh"
        >
          <MessageSquare size={22} />
        </button>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button 
          onClick={scrollToTop}
          className="hidden md:flex fixed bottom-[380px] right-6 w-11 h-11 bg-primary text-white rounded-full items-center justify-center shadow-md z-[998] transition-all hover:bg-primary-dark hover:-translate-y-0.5 animate-fade-in"
          title="Quay lại đầu trang"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
      )}

      {/* Contact Popup Overlay */}
      {isPopupOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsPopupOpen(false)}
        >
          <div
            className="bg-white rounded-[24px] p-9 max-w-[480px] w-full relative shadow-2xl animate-scale-up border border-line overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -right-8 -top-8 pointer-events-none opacity-[0.04]"><Monogram size={150} withText={false} tone="brand" /></div>
            <button
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-paper text-gray-400 hover:text-gray-900 transition-colors z-10"
            >
              <X size={18} />
            </button>
            <span className="eyebrow mb-3">Hỗ trợ 24/7</span>
            <h3 className="font-display text-2xl font-semibold mb-5 text-ink leading-tight">Liên hệ nhanh</h3>
            <div className="space-y-4 mb-6">
               <div className="flex items-start gap-2.5 text-[0.9rem] text-gray-700">
                 <Phone size={16} className="mt-1 text-primary shrink-0" />
                 <div><strong>Hotline:</strong> {settings?.hotline1}</div>
               </div>
               <div className="flex items-start gap-2.5 text-[0.9rem] text-gray-700">
                 <Phone size={16} className="mt-1 text-primary shrink-0" />
                 <div><strong>Điện thoại:</strong> {settings?.support?.doctorPhone}</div>
               </div>
               <div className="flex items-start gap-2.5 text-[0.9rem] text-gray-700">
                 <Mail size={16} className="mt-1 text-primary shrink-0" />
                 <div><strong>Email:</strong> {settings?.support?.doctorEmail}</div>
               </div>
               <div className="flex items-start gap-2.5 text-[0.9rem] text-gray-700">
                 <Globe size={16} className="mt-1 text-primary shrink-0" />
                 <div><strong>Website:</strong> www.binovet.com.vn</div>
               </div>
               <div className="flex items-start gap-2.5 text-[0.9rem] text-gray-700">
                 <MapPin size={16} className="mt-1 text-primary shrink-0" />
                 <div><strong>Địa chỉ:</strong> {settings?.addressHN || settings?.addressHCM}</div>
               </div>
            </div>
            <Link
              href="/lien-he"
              className="btn btn-primary w-full"
              onClick={() => setIsPopupOpen(false)}
            >
              <Send size={16} /> Gửi tin nhắn
            </Link>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
