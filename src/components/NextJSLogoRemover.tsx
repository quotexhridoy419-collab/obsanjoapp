'use client';

import { useEffect } from 'react';

export default function NextJSLogoRemover() {
  useEffect(() => {
    const removeNextJSLogo = () => {
      // Remove any element that might be the Next.js logo
             const selectors = [
         // Only target the actual Next.js logo with specific positioning
         'div[style*="position: fixed"][style*="bottom"][style*="left"][style*="z-index: 9999"]',
         'div[style*="position: fixed"][style*="bottom"][style*="left"][style*="z-index: 2147483647"]',
         'div[style*="position: fixed"][style*="bottom"][style*="right"][style*="z-index: 9999"]',
         'div[style*="position: fixed"][style*="bottom"][style*="right"][style*="z-index: 2147483647"]',
         // Development indicators
         '.nextjs-toast-errors-parent',
         '.nextjs-toast-errors-parent > div',
         // Next.js branding in title
         'div[title*="Next.js"]',
         'div[title*="next"]',
         'div[title*="Next"]',
         // Development indicators with specific positioning
         'div[role="button"][style*="position: fixed"][style*="bottom"]',
         'div[tabindex][style*="position: fixed"][style*="bottom"]',
         // Only target elements at the bottom that might be the logo
         'body > div:last-child:not([data-nextjs-router-viewport]):not([data-nextjs-toaster]):has(svg)',
         'div[style*="position: fixed"][style*="bottom"]:has(svg[viewBox*="24"])',
         'div[style*="position: fixed"][style*="bottom"]:has(svg[width="24"])',
         'div[style*="position: fixed"][style*="bottom"]:has(svg[height="24"])'
       ];
      
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el && !el.hasAttribute('data-nextjs-toaster')) {
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
              el.style.position = 'absolute';
              el.style.left = '-9999px';
              el.style.top = '-9999px';
              el.style.width = '120';
              el.style.height = '40';
              el.style.overflow = 'hidden';
            }
          });
        } catch (error) {
          // Ignore errors for invalid selectors
        }
      });
    };

    // Run immediately
    removeNextJSLogo();
    
    // Run after a short delay to catch any late-loading elements
    setTimeout(removeNextJSLogo, 100);
    setTimeout(removeNextJSLogo, 500);
    setTimeout(removeNextJSLogo, 1000);
    
    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      removeNextJSLogo();
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
