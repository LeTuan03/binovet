"use client";

import { useEffect, useState } from "react";

const LOADING_DELAY_MS = 150;

export default function Loading() {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => setShowLoader(true), LOADING_DELAY_MS);
    return () => globalThis.clearTimeout(timer);
  }, []);

  if (!showLoader) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-200">
      <div className="pointer-events-auto rounded-3xl bg-white/95 p-6 shadow-2xl">
        <div className="mb-6 animate-pulse opacity-70">
          <img
            src="/images/logo.png"
            alt="Loading..."
            width={100} 
            height={100} 
            className="h-auto w-auto grayscale brightness-110"
          />
        </div>

        <div className="relative h-1 w-32 overflow-hidden rounded-full bg-slate-100">
          <div 
            className="absolute h-full w-full bg-primary"
            style={{
              animation: 'loading-bar 1.5s infinite ease-in-out',
              left: '-100%'
            }}
          ></div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
          0% { left: -100%; width: 30%; }
          50% { left: 0%; width: 60%; }
          100% { left: 100%; width: 30%; }
        }
      `}} />
    </div>
  );
}
