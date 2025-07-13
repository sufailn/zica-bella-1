"use client";
import { useEffect, useState } from 'react';

interface TopLoaderState {
  isLoading: boolean;
  progress: number;
  showSplash: boolean;
}

export const useTopLoader = () => {
  const [state, setState] = useState<TopLoaderState>({
    isLoading: false,
    progress: 0,
    showSplash: false,
  });

  useEffect(() => {
    // Listen for TopLoader events
    const handleTopLoaderStart = () => {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        showSplash: true, 
        progress: 0 
      }));
    };

    const handleTopLoaderProgress = (event: CustomEvent) => {
      setState(prev => ({ ...prev, progress: event.detail.progress }));
    };

    const handleTopLoaderComplete = () => {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        showSplash: false, 
        progress: 100 
      }));
    };

    // Add event listeners
    window.addEventListener('toploader:start', handleTopLoaderStart);
    window.addEventListener('toploader:progress', handleTopLoaderProgress as EventListener);
    window.addEventListener('toploader:complete', handleTopLoaderComplete);

    // Cleanup
    return () => {
      window.removeEventListener('toploader:start', handleTopLoaderStart);
      window.removeEventListener('toploader:progress', handleTopLoaderProgress as EventListener);
      window.removeEventListener('toploader:complete', handleTopLoaderComplete);
    };
  }, []);

  return state;
};

export default useTopLoader; 