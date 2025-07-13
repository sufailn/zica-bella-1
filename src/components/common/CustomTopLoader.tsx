"use client";
import { useTopLoader } from '@/hooks/useTopLoader';
import SplashScreen from './SplashScreen';

interface CustomTopLoaderProps {
  children: React.ReactNode;
}

const CustomTopLoader: React.FC<CustomTopLoaderProps> = ({ children }) => {
  const { isLoading, showSplash } = useTopLoader();

  // Show splash screen while loading
  if (showSplash && isLoading) {
    return (
      <div className="min-h-screen w-screen bg-black flex items-center justify-center">
        <SplashScreen />
      </div>
    );
  }

  // Show children when loading is complete
  return <>{children}</>;
};

export default CustomTopLoader; 