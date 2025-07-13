"use client";
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const RouterEvents = () => {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Dispatch custom events for TopLoader
    const dispatchTopLoaderEvent = (eventName: string, detail?: any) => {
      const event = new CustomEvent(`toploader:${eventName}`, { detail });
      window.dispatchEvent(event);
    };

    // Only trigger events if pathname changed and it's not the home page
    if (previousPathname.current !== pathname && pathname !== '/') {
      dispatchTopLoaderEvent('start');
      
      // Simulate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        dispatchTopLoaderEvent('progress', { progress });
        
        if (progress >= 90) {
          clearInterval(progressInterval);
        }
      }, 100);

      // Complete after a delay
      setTimeout(() => {
        clearInterval(progressInterval);
        dispatchTopLoaderEvent('complete');
      }, 1000);

      previousPathname.current = pathname;
    }

    // Listen for navigation events
    const handleBeforeUnload = () => {
      if (pathname !== '/') {
        dispatchTopLoaderEvent('start');
      }
    };

    const handleNavigationStart = () => {
      if (pathname !== '/') {
        dispatchTopLoaderEvent('start');
      }
    };

    const handleNavigationComplete = () => {
      if (pathname !== '/') {
        dispatchTopLoaderEvent('complete');
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('navigation:start', handleNavigationStart);
    window.addEventListener('navigation:complete', handleNavigationComplete);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('navigation:start', handleNavigationStart);
      window.removeEventListener('navigation:complete', handleNavigationComplete);
    };
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default RouterEvents; 