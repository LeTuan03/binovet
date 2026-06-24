"use client";

import React from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare } from 'lucide-react';
import { FacebookOutlined, YoutubeOutlined } from '@ant-design/icons';
import PageHero from '@/components/shared/PageHero';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function ContactContent({ settings }: { settings: any }) {
   const { locale } = useLocale();
   const [formData, setFormData] = React.useState({
      fullName: '',
      phoneNumber: '',
      emailAddress: '',
      messageBox: '',
   });

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const { fullName, phoneNumber, emailAddress, messageBox } = formData;
      const emailTo = settings?.email || 'pkd.binovet@gmail.com';
      const subject = encodeURIComponent(
         locale === 'en' ? `Request from ${fullName}` : `Yêu cầu từ ${fullName}`
      );
      const body = encodeURIComponent(
         locale === 'en'
            ? `Full name: ${fullName}\n` +
              `Phone number: ${phoneNumber}\n` +
              `Email: ${emailAddress}\n` +
              `\n--- Message ---\n` +
              `${messageBox}`
            : `Họ tên: ${fullName}\n` +
              `Số điện thoại: ${phoneNumber}\n` +
              `Email: ${emailAddress}\n` +
              `\n--- Nội dung yêu cầu ---\n` +
              `${messageBox}`
      );

      window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
   };

   return (
      <div className="bg-white min-h-screen">
         <PageHero
            locale={locale}
            eyebrow={locale === 'en' ? "Let's talk" : 'Kết nối'}
            title={locale === 'en' ? 'Contact Biotechvet' : 'Liên Hệ Biotechvet'}
            subtitle={locale === 'en' ? 'We are always ready to listen and answer all your questions 24/7.' : 'Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn 24/7.'}
            breadcrumb={[{ label: locale === 'en' ? 'Contact' : 'Liên hệ' }]}
         />

         <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
               {/* Information Column */}
               <div className="space-y-12">
                  <div>
                     <span className="eyebrow mb-4">{locale === 'en' ? 'Get in touch' : 'Liên hệ'}</span>
                     <h2 className="text-3xl font-semibold text-ink accent-underline pb-3">{locale === 'en' ? 'Head Office Information' : 'Thông Tin Trụ Sở'}</h2>
                  </div>

                  <div className="space-y-8">
                     <div className="flex gap-6 items-start group">
                        <div className="w-14 h-14 rounded-2xl bg-primary/8 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                           <MapPin size={24} />
                        </div>
                        <div>
                           <h4 className="text-xs font-montserrat font-semibold text-ink-soft uppercase tracking-[0.12em] mb-2">{locale === 'en' ? 'Head office address' : 'Địa chỉ trụ sở chính'}</h4>
                           <p className="text-lg font-medium text-ink leading-relaxed">{settings?.addressHN || 'Cụm CN Liên Phương, Xã Hồng Vân, Thường Tín, Hà Nội'}</p>
                        </div>
                     </div>

                     <div className="flex gap-6 items-start group">
                        <div className="w-14 h-14 rounded-2xl bg-primary/8 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                           <Phone size={24} />
                        </div>
                        <div>
                           <h4 className="text-xs font-montserrat font-semibold text-ink-soft uppercase tracking-[0.12em] mb-2">{locale === 'en' ? 'Support phone' : 'Điện thoại hỗ trợ'}</h4>
                           <p className="text-lg font-medium text-ink leading-relaxed">{settings?.hotline1 || '024 66861629'} / {settings?.hotline2 || '097 499 9204'}</p>
                        </div>
                     </div>

                     <div className="flex gap-6 items-start group">
                        <div className="w-14 h-14 rounded-2xl bg-primary/8 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                           <Mail size={24} />
                        </div>
                        <div>
                           <h4 className="text-xs font-montserrat font-semibold text-ink-soft uppercase tracking-[0.12em] mb-2">{locale === 'en' ? 'Feedback email' : 'Email phản hồi'}</h4>
                           <p className="text-lg font-medium text-ink leading-relaxed link-underline inline-block">{settings?.email || 'pkd.binovet@gmail.com'}</p>
                        </div>
                     </div>
                  </div>

                  {/* Branch Information */}
                  {settings?.addressHCM && (
                     <div className="card-elegant bg-sand p-8 lg:p-10">
                        <h3 className="text-xl font-semibold text-ink mb-4">{locale === 'en' ? 'Southern Branch' : 'Chi nhánh Miền Nam'}</h3>
                        <div className="space-y-4">
                           <p className="text-ink-soft leading-relaxed flex items-center gap-3"><MapPin size={16} className="text-secondary shrink-0" /> {settings.addressHCM}</p>
                           {settings.hotline2 && <p className="text-ink-soft flex items-center gap-3"><Phone size={16} className="text-secondary shrink-0" /> {settings.hotline2}</p>}
                        </div>
                     </div>
                  )}

                  {/* Technical Support */}
                  <div className="card-elegant bg-cream p-8 lg:p-10">
                     <h3 className="text-xl font-semibold text-ink mb-6">{locale === 'en' ? 'Technical Support' : 'Hỗ Trợ Kỹ Thuật'}</h3>
                     <div className="space-y-5">
                        <div className="flex gap-4 items-start">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shrink-0 border border-line">
                              <Phone size={18} />
                           </div>
                           <div>
                              <p className="text-xs font-montserrat font-semibold text-ink-soft uppercase tracking-[0.12em] mb-1">{locale === 'en' ? 'Product consultation' : 'Tư vấn sản phẩm'}</p>
                              <p className="text-ink font-medium">{settings?.hotline1}</p>
                           </div>
                        </div>
                        <div className="flex gap-4 items-start">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shrink-0 border border-line">
                              <Mail size={18} />
                           </div>
                           <div>
                              <p className="text-xs font-montserrat font-semibold text-ink-soft uppercase tracking-[0.12em] mb-1">{locale === 'en' ? 'Support email' : 'Email hỗ trợ'}</p>
                              <p className="text-ink font-medium">{settings?.support?.doctorEmail}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex flex-wrap gap-4">
                     {settings?.social?.facebook && (
                        <a href={settings.social.facebook} target="_blank" className="btn btn-outline">
                           <FacebookOutlined className="text-lg" /> {locale === 'en' ? 'Connect on Facebook' : 'Kết nối Facebook'}
                        </a>
                     )}
                     {settings?.social?.youtube && (
                        <a href={settings.social.youtube} target="_blank" className="btn btn-outline">
                           <YoutubeOutlined className="text-lg" /> {locale === 'en' ? 'YouTube Channel' : 'Kênh YouTube'}
                        </a>
                     )}
                  </div>
               </div>

               {/* Form Column */}
               <div className="card-elegant p-10 md:p-14 relative overflow-hidden lg:sticky lg:top-24 self-start">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                        <MessageSquare size={24} strokeWidth={1.75} />
                     </div>
                     <div>
                        <span className="eyebrow mb-1">{locale === 'en' ? 'Enquiry' : 'Gửi yêu cầu'}</span>
                        <h3 className="text-2xl font-semibold text-ink leading-tight">{locale === 'en' ? 'Send Message' : 'Gửi Tin Nhắn'}</h3>
                     </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label htmlFor="fullName" className="block text-xs font-montserrat font-semibold uppercase text-ink-soft tracking-[0.12em] mb-2">{locale === 'en' ? 'Full name *' : 'Họ và tên *'}</label>
                              <input id="fullName" name="fullName" type="text" placeholder={locale === 'en' ? 'Enter your full name' : 'Nhập họ tên của bạn'} value={formData.fullName} onChange={handleInputChange} className="w-full bg-cream border border-line rounded-xl px-5 py-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all placeholder:text-ink-soft/50" required={true} />
                           </div>
                           <div>
                              <label htmlFor="phoneNumber" className="block text-xs font-montserrat font-semibold uppercase text-ink-soft tracking-[0.12em] mb-2">{locale === 'en' ? 'Phone number *' : 'Số điện thoại *'}</label>
                              <input id="phoneNumber" name="phoneNumber" type="tel" placeholder={locale === 'en' ? 'Enter your phone number' : 'Nhập số điện thoại'} value={formData.phoneNumber} onChange={handleInputChange} className="w-full bg-cream border border-line rounded-xl px-5 py-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all placeholder:text-ink-soft/50" required={true} />
                           </div>
                        </div>
                        <div>
                           <label htmlFor="emailAddress" className="block text-xs font-montserrat font-semibold uppercase text-ink-soft tracking-[0.12em] mb-2">{locale === 'en' ? 'Email address' : 'Địa chỉ Email'}</label>
                           <input id="emailAddress" name="emailAddress" type="email" placeholder={locale === 'en' ? 'Enter your email address' : 'Nhập địa chỉ email'} value={formData.emailAddress} onChange={handleInputChange} className="w-full bg-cream border border-line rounded-xl px-5 py-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all placeholder:text-ink-soft/50" />
                        </div>
                        <div>
                           <label htmlFor="messageBox" className="block text-xs font-montserrat font-semibold uppercase text-ink-soft tracking-[0.12em] mb-2">{locale === 'en' ? 'Your message *' : 'Nội dung yêu cầu *'}</label>
                           <textarea id="messageBox" name="messageBox" rows={5} placeholder={locale === 'en' ? 'How can we help you?' : 'Bạn cần chúng tôi hỗ trợ gì?'} value={formData.messageBox} onChange={handleInputChange} className="w-full bg-cream border border-line rounded-xl px-5 py-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all placeholder:text-ink-soft/50" required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary w-full group">
                           <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> {locale === 'en' ? 'Send request now' : 'Gửi yêu cầu ngay'}
                        </button>
                     </form>
               </div>
            </div>

            {/* SLOGAN */}
            <div className="bg-binovet-dark text-white p-12 lg:p-20 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center text-center mt-20 lg:mt-28 shadow-elegant-lg">
               <div className="absolute inset-0 bg-molecule opacity-60" />
               <div className="relative z-10 flex flex-col items-center">
                  <div className="divider-diamond mb-6"><span /></div>
                  <h3 className="text-3xl md:text-4xl font-semibold text-white leading-tight mb-4">
                     {locale === 'en' ? 'Quality Is Our Commitment' : 'Chất lượng Là Cam Kết'}
                  </h3>
                  <p className="text-lg text-white/75">
                     {locale === 'en' ? 'With BiotechVet - Enhancing the value of Vietnamese livestock farming' : 'Cùng BiotechVet - Nâng cao giá trị chăn nuôi Việt Nam'}
                  </p>
               </div>
            </div>

            {/* Google Maps */}
            <div className="mt-20 lg:mt-28 w-full h-[500px] rounded-2xl overflow-hidden border border-line shadow-elegant">
               <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3727.9957!2d105.8652!3d20.8305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCụm+CN+Li%C3%AAn+Ph%C6%B0%C6%A1ng%2C+X%C3%A3+H%E1%BB%93ng+V%C3%A2n%2C+Th%C6%B0%E1%BB%9Dng+T%C3%ADn%2C+H%C3%A0+N%E1%BB%99i!5e0!3m2!1svi!2svn!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={locale === 'en' ? 'BiotechVet map - Lien Phuong Industrial Cluster, Hong Van, Thuong Tin, Hanoi' : 'Bản đồ BiotechVet - Cụm CN Liên Phương, Xã Hồng Vân, Thường Tín, Hà Nội'}
               />
            </div>
         </div>
      </div>
   );
}
