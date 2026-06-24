"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide loader when the page is fully loaded
    const handleLoad = () => {
      // Small timeout to ensure everything is rendered
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 600);
      return () => clearTimeout(timeout);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      // Fallback in case load event already fired or takes too long
      const fallback = setTimeout(handleLoad, 3000);
      
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(fallback);
      };
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white"
        >
          <div className="relative flex flex-col items-center">
            {/* Logo animation */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [0.9, 1.05, 1], opacity: 1 }}
              transition={{ 
                duration: 0.8,
                times: [0, 0.6, 1],
                ease: "easeOut"
              }}
              className="mb-8"
            >
              <img
                src="/images/logo.png"
                alt="BINOVET"
                width={150} 
                height={150} 
                className="h-auto w-auto max-w-[150px]"
              />
            </motion.div>

            {/* Loading Indicator */}
            <div className="relative h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="absolute h-full bg-primary"
                initial={{ left: "-100%", width: "100%" }}
                animate={{ left: "100%" }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: "easeInOut" 
                }}
              />
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-[13px] font-semibold tracking-[0.2em] text-primary uppercase"
            >
              Loading...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
