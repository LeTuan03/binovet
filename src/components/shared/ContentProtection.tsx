"use client";

import { useEffect } from 'react';

export default function ContentProtection() {
  useEffect(() => {
    const isAdmin = () =>
      globalThis.window !== undefined &&
      localStorage.getItem('admin_token') === process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET;

    // 1. Block right-click (cho phép khi là admin để dùng copy/paste qua context menu)
    const handleContextMenu = (e: MouseEvent) => {
      if (isAdmin()) return;
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // 2. Block keyboard shortcuts (admin được phép copy/paste)
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey; // metaKey cho Mac
      const key = e.key.toLowerCase();
      const admin = isAdmin();
      // Với admin: bỏ chặn các phím copy/paste/cut/select-all
      const ctrlBlockedKeys = admin ? ['u','s','p'] : ['u','s','c','p','a'];
      const blocked =
        (ctrl && ctrlBlockedKeys.includes(key)) ||
        (ctrl && e.shiftKey && ['i','j','c','k'].includes(key)) ||
        ['F12'].includes(e.key);
      if (blocked) e.preventDefault();
    };
    document.addEventListener('keydown', handleKeyDown);

    // 5. DevTools detection - use viewport heuristic because debugger timing is unreliable
    let devtoolsInterval: ReturnType<typeof setInterval>;
    const isMobile = () => /mobile|android|iphone|ipad|tablet/i.test(navigator.userAgent);
    // const detectDevTools = () => {
    //   if (isMobile()) return false; // Disable detection on mobile to avoid false positives
    //   const threshold = 160;
    //   const widthDiff = window.outerWidth - window.innerWidth;
    //   const heightDiff = window.outerHeight - window.innerHeight;
    //   return widthDiff > threshold || heightDiff > threshold;
    // };
    // devtoolsInterval = setInterval(() => {
    //   if (detectDevTools()) {
    //     globalThis.location.replace('/images/favicon.ico');
    //   }
    // }, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      // clearInterval(devtoolsInterval);
    };
  }, []);

  return null;
}