"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import SplashScreen from './SplashScreen';

interface PageLoaderProps {
  children: React.ReactNode;
}

const PageLoader: React.FC<PageLoaderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const pathname = usePathname();

  // Check if this is the home page
  const isHomePage = pathname === '/';

  useEffect(() => {
    // Skip loader for home page
    if (isHomePage) {
      setIsLoading(false);
      setIsInitialLoad(false);
      return;
    }

    // Show loader for initial load
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsInitialLoad(false);
      }, 1000); // Show loader for 1 second on initial load

      return () => clearTimeout(timer);
    }

    // Show loader for route changes (except home page)
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Show loader for 500ms on route changes

    return () => clearTimeout(timer);
  }, [pathname, isHomePage, isInitialLoad]);

  // Don't show loader for home page
  if (isHomePage) {
    return <>{children}</>;
  }

  // Show loader while loading
  if (isLoading) {
    return (
      <div className="min-h-screen w-screen bg-black flex items-center justify-center">
        <SplashScreen />
      </div>
    );
  }

  // Show children when loading is complete
  return <>{children}</>;
};

export default PageLoader; 