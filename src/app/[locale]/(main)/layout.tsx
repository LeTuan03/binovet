import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MotionProvider from "@/components/shared/MotionProvider";
// import FloatingContact from "@/components/layout/FloatingContact";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MotionProvider>
      <div className="site-shell flex flex-col min-h-screen" suppressHydrationWarning>
        <Header />
        <main className="flex-1 overflow-x-clip" suppressHydrationWarning>{children}</main>
        <Footer />
        {/* <FloatingContact settings={settings} /> */}
      </div>
    </MotionProvider>
  );
}
