"use client";
import { useState, lazy, Suspense, useEffect, useRef } from "react";

// Lazy load components
const CategoryTabs = lazy(() => import("./CategoryTabs"));
const ProductCard = lazy(() => import("./ProductCard"));
const ProductTitle = lazy(() => import("./ProductTitle"));

// Loading fallback components
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-4"></div>
  </div>
);

const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-gray-200 rounded mb-4"></div>
    <div className="h-4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <ProductCard product={product} isNotLastColumn={isNotLastColumn} />
        </Suspense>
      ) : (
        <ProductCardSkeleton />
      )}
    </div>
  );
};

const ProductsSection = () => {
  const [activeCategory, setActiveCategory] = useState('VIEW ALL');

  // Sample product data matching the UI
  const products = [
    {
      id: 1,
      name: "AVOINE HOODED QUILTED JACKET",
      price: 1500,
      images: ["/shop/image1.jpeg", "/shop/image2.jpeg", "/shop/image4.jpeg","/shop/image5.jpeg"],
      category: "JACKETS",
      soldOut: false
    },
    {
      id: 2,
      name: "AVOINE HOODED QUILTED JACKET",
      price: 1500,
      images: ["/shop/image2.jpeg", "/shop/image3.jpeg", "/shop/image1.jpeg"],
      category: "JACKETS",
      soldOut: true
    },
    {
      id: 3,
      name: "CLASSIC SHIRT",
      price: 800,
      images: ["/shop/image1.jpeg", "/shop/image2.jpeg"],
      category: "SHIRTS",
      soldOut: true
    },
    {
      id: 4,
      name: "GRAPHIC TEE",
      price: 600,
      images: ["/shop/image2.jpeg"],
      category: "SHIRTS",
      soldOut: true
    },
    {
      id: 5,
      name: "DENIM JEANS",
      price: 1200,
      images: ["/shop/image4.jpeg", "/shop/image5.jpeg"],
      category: "JEANS",
      soldOut: false
    },
    {
      id: 6,
      name: "SUMMER SHORTS",
      price: 700,
      images: ["/shop/image6.jpeg"],
      category: "SHORTS",
      soldOut: false
    },
    {
      id: 7,
      name: "WOOLEN SWEATER",
      price: 1100,
      images: ["/shop/image6.jpeg", "/shop/image2.jpeg", "/shop/image4.jpeg"],
      category: "SWEATERS",
      soldOut: true
    },
    {
      id: 8,
      name: "CASUAL POLO",
      price: 900,
      images: ["/shop/image2.jpeg","/shop/image6.jpeg", "/shop/image1.jpeg"],
      category: "SHIRTS",
      soldOut: false
    }
  ];

  const filteredProducts = activeCategory === 'VIEW ALL' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <div className="pt-8 px-0">
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
