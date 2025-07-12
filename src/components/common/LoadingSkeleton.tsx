import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'product' | 'profile' | 'order' | 'text' | 'avatar' | 'custom';
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  className = '',
  count = 1,
  height,
  width,
}) => {
  const baseClasses = 'animate-pulse bg-gray-300 rounded';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'product':
        return 'h-80 w-full bg-gray-900';
      case 'profile':
        return 'h-20 w-20 bg-gray-700 rounded-full';
      case 'order':
        return 'h-32 w-full bg-gray-900';
      case 'text':
        return 'h-4 w-full bg-gray-700';
      case 'avatar':
        return 'h-10 w-10 bg-gray-700 rounded-full';
      case 'custom':
        return '';
      default:
        return 'h-4 w-full bg-gray-700';
    }
  };

  const skeletonClasses = `${baseClasses} ${getVariantClasses()} ${className}`;
  const style = {
    height: height || undefined,
    width: width || undefined,
  };

  if (count === 1) {
    return <div className={skeletonClasses} style={style} />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClasses} style={style} />
      ))}
    </div>
  );
};

// Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-gray-900 rounded-lg overflow-hidden">
        <LoadingSkeleton variant="product" />
        <div className="p-4 space-y-2">
          <LoadingSkeleton variant="text" className="h-4 w-3/4" />
          <LoadingSkeleton variant="text" className="h-3 w-1/2" />
          <LoadingSkeleton variant="text" className="h-5 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

// Orders List Skeleton
export const OrdersListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-gray-900 p-6 rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <LoadingSkeleton variant="text" className="h-6 w-40" />
            <LoadingSkeleton variant="text" className="h-4 w-32" />
          </div>
          <LoadingSkeleton variant="text" className="h-6 w-20" />
        </div>
        <div className="space-y-2 mb-4">
          <LoadingSkeleton variant="text" className="h-4 w-full" />
          <LoadingSkeleton variant="text" className="h-4 w-3/4" />
        </div>
        <div className="flex justify-between items-center">
          <LoadingSkeleton variant="text" className="h-4 w-24" />
          <LoadingSkeleton variant="text" className="h-6 w-16" />
        </div>
      </div>
    ))}
  </div>
);

// Profile Form Skeleton
export const ProfileFormSkeleton: React.FC = () => (
  <div className="bg-gray-900 p-6 rounded-lg">
    <LoadingSkeleton variant="text" className="h-6 w-48 mb-6" />
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <LoadingSkeleton variant="text" className="h-4 w-20 mb-2" />
          <LoadingSkeleton variant="text" className="h-10 w-full" />
        </div>
        <div>
          <LoadingSkeleton variant="text" className="h-4 w-20 mb-2" />
          <LoadingSkeleton variant="text" className="h-10 w-full" />
        </div>
      </div>
      <div>
        <LoadingSkeleton variant="text" className="h-4 w-16 mb-2" />
        <LoadingSkeleton variant="text" className="h-10 w-full" />
      </div>
      <div>
        <LoadingSkeleton variant="text" className="h-4 w-16 mb-2" />
        <LoadingSkeleton variant="text" className="h-10 w-full" />
      </div>
      <LoadingSkeleton variant="text" className="h-10 w-32" />
    </div>
  </div>
);

export default LoadingSkeleton; 