"use client";

import React from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare } from 'lucide-react';
import { FacebookOutlined, YoutubeOutlined } from '@ant-design/icons';

export default function ContactContent() {
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get('fullName'),
      phoneNumber: formData.get('phoneNumber'),
      emailAddress: formData.get('emailAddress'),
      messageBox: formData.get('messageBox'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
      alert('Đã có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <section className="bg-binovet-dark text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/farm.png')] bg-cover bg-center"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
           <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-wider italic">Liên Hệ binovet</h1>
           <p className="text-xl text-primary-light max-w-2xl mx-auto font-medium">Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn 24/7.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Information Column */}
          <div className="space-y-12">
             <h2 className="text-3xl font-black text-binovet-dark uppercase italic mb-8 tracking-tight">Thông Tin Trụ Sở</h2>
             
             <div className="space-y-8">
                <div className="flex gap-6 items-start group">
                   <div className="w-14 h-14 bg-binovet-alt rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                      <MapPin size={24} />
                   </div>
                   <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Địa chỉ trụ sở chính</h4>
                      <p className="text-lg font-bold text-binovet-dark leading-relaxed">Cụm CN Liên Phương, Xã Hồng Vân, Thường Tín, Hà Nội</p>
                   </div>
                </div>

                <div className="flex gap-6 items-start group">
                   <div className="w-14 h-14 bg-binovet-alt rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                      <Phone size={24} />
                   </div>
                   <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Điện thoại hỗ trợ</h4>
                      <p className="text-lg font-bold text-binovet-dark leading-relaxed">024 66861629 / 097 499 9204</p>
                   </div>
                </div>

                <div className="flex gap-6 items-start group">
                   <div className="w-14 h-14 bg-binovet-alt rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                      <Mail size={24} />
                   </div>
                   <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email phản hồi</h4>
                      <p className="text-lg font-bold text-binovet-dark leading-relaxed underline">pkd.binovet@gmail.com</p>
                   </div>
                </div>
             </div>

             {/* Branch Information */}
             <div className="bg-binovet-alt p-10 rounded-[40px] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-binovet-dark mb-4 uppercase tracking-wider">Chi nhánh Miền Nam</h3>
                <div className="space-y-4">
                   <p className="text-gray-600 font-medium leading-relaxed flex items-center gap-3"><MapPin size={16} className="text-primary" /> Hố Nai, Trảng Bom, Đồng Nai</p>
                   <p className="text-gray-600 font-medium flex items-center gap-3"><Phone size={16} className="text-primary" /> 0936 100 008</p>
                </div>
             </div>

             {/* Social Links */}
             <div className="flex gap-4">
                <a href="https://www.facebook.com/BiotechVietNam1" target="_blank" className="flex items-center gap-3 bg-blue-600 text-white font-black py-4 px-8 rounded-full text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                   <FacebookOutlined className="text-xl" /> Kết nối Facebook
                </a>
                <a href="https://youtube.com/binovet" target="_blank" className="flex items-center gap-3 bg-red-600 text-white font-black py-4 px-8 rounded-full text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                   <YoutubeOutlined className="text-xl" /> Kênh YouTube
                </a>
             </div>
          </div>

          {/* Form Column */}
          <div className="bg-white rounded-[48px] p-10 md:p-14 border border-gray-100 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             
             {status === 'success' ? (
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
                   <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                      <Send size={40} className="animate-bounce" />
                   </div>
                   <h3 className="text-3xl font-black text-binovet-dark uppercase italic mb-4">Gửi Thành Công!</h3>
                   <p className="text-gray-500 font-medium max-w-xs leading-relaxed">Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm nhất có thể.</p>
                   <button 
                      onClick={() => setStatus('idle')}
                      className="mt-10 text-primary font-black uppercase tracking-widest text-sm hover:underline"
                   >
                      Gửi tin nhắn khác
                   </button>
                </div>
             ) : (
                <>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                       <MessageSquare size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-binovet-dark uppercase tracking-tight italic">Gửi Tin Nhắn</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label htmlFor="fullName" className="block text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-2 px-4 italic">Họ và tên *</label>
                          <input id="fullName" name="fullName" type="text" placeholder="Nhập họ tên của bạn" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-gray-300" required />
                       </div>
                       <div>
                          <label htmlFor="phoneNumber" className="block text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-2 px-4 italic">Số điện thoại *</label>
                          <input id="phoneNumber" name="phoneNumber" type="tel" placeholder="Nhập số điện thoại" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-gray-300" required />
                       </div>
                    </div>
                    <div>
                       <label htmlFor="emailAddress" className="block text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-2 px-4 italic">Địa chỉ Email</label>
                       <input id="emailAddress" name="emailAddress" type="email" placeholder="Nhập địa chỉ email" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-gray-300" />
                    </div>
                    <div>
                       <label htmlFor="messageBox" className="block text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-2 px-4 italic">Nội dung yêu cầu *</label>
                       <textarea id="messageBox" name="messageBox" rows={5} placeholder="Bạn cần chúng tôi hỗ trợ gì?" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-gray-300" required></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={status === 'sending'}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[3px] transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                    >
                       {status === 'sending' ? (
                          <span className="flex items-center gap-2">Đang gửi...</span>
                       ) : (
                          <><Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Gửi yêu cầu ngay</>
                       )}
                    </button>
                  </form>
                </>
             )}
          </div>
        </div>

        {/* Google Maps */}
        <div className="mt-24 w-full h-[500px] rounded-[48px] overflow-hidden shadow-2xl border-8 border-white">
           <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3727.9957!2d105.8652!3d20.8305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCụm+CN+Li%C3%AAn+Ph%C6%B0%C6%A1ng%2C+X%C3%A3+H%E1%BB%93ng+V%C3%A2n%2C+Th%C6%B0%E1%BB%9Dng+T%C3%ADn%2C+H%C3%A0+N%E1%BB%99i!5e0!3m2!1svi!2svn!4v1700000000000"
             width="100%" 
             height="100%" 
             style={{ border: 0 }} 
             allowFullScreen 
             loading="lazy" 
             referrerPolicy="no-referrer-when-downgrade"
             title="Bản đồ binovet - Cụm CN Liên Phương, Xã Hồng Vân, Thường Tín, Hà Nội"
           />
        </div>
      </div>
    </div>
  );
}
