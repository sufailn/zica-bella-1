"use client";
import { useState, lazy, Suspense, useEffect, useRef } from "react";
import { useProducts } from "@/context/ProductContext";

// Lazy load components
const CategoryTabs = lazy(() => import("./CategoryTabs"));
const ProductCard = lazy(() => import("./ProductCard"));
const ProductTitle = lazy(() => import("./ProductTitle"));

// Loading fallback components
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-900 rounded mb-4"></div>
  </div>
);

const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-gray-900 rounded mb-4"></div>
    <div className="h-4 bg-gray-900 rounded mb-2"></div>
    <div className="h-4 bg-gray-900 rounded w-1/2"></div>
  </div>
);

// Lazy Product Card Wrapper with Intersection Observer
const LazyProductCard = ({ product, isNotLastColumn, index }: any) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? (
        <Suspense fallback={<ProductCardSkeleton />}>
          <ProductCard product={product} isNotLastColumn={isNotLastColumn}  />
        </Suspense>
      ) : (
        <ProductCardSkeleton />
      )}
    </div>
  );
};

const ProductsSection = () => {
  const [activeCategory, setActiveCategory] = useState('VIEW ALL');
  const { getProductsByCategory } = useProducts();

  const filteredProducts = getProductsByCategory(activeCategory);

  return (
    <div className="pt-8 px-0 text-white bg-black">
      {/* Category Tabs */}
      <Suspense fallback={<LoadingSkeleton />}>
        <ProductTitle />
      </Suspense>
      
      <Suspense fallback={<LoadingSkeleton />}>
        <CategoryTabs onCategoryChange={setActiveCategory} />
      </Suspense>
      
      {/* Products Grid */}
      <div className="mt-8 grid grid-cols-2 gap-x-0 lg:grid-cols-4">
        {filteredProducts.map((product, index) => {
          const isNotLastColumn = (index + 1) % 2 !== 0 && index !== filteredProducts.length - 1;
          return (
            <LazyProductCard 
              key={product.id} 
              product={product} 
              isNotLastColumn={isNotLastColumn}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ProductsSection;
