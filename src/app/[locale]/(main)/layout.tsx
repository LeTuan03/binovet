import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
// import FloatingContact from "@/components/layout/FloatingContact";
import { settingService } from "@/services";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = (await settingService.get()) as any;
  return (
    <div className="site-shell flex flex-col min-h-screen" suppressHydrationWarning>
      <Header />
      <main className="flex-1" suppressHydrationWarning>{children}</main>
      <Footer />
      {/* <FloatingContact settings={settings} /> */}
    </div>
  );
}
