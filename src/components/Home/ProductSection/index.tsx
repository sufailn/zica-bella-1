"use client";
import { useState, lazy, Suspense, useEffect, useRef } from "react";
import { useProducts } from "@/context/ProductContext";

// Lazy load components
const CategoryTabs = lazy(() => import("./CategoryTabs"));
const ProductCard = lazy(() => import("./ProductCard"));
const ProductTitle = lazy(() => import("./ProductTitle"));
const ParallaxSection = lazy(() => import("../ParallaxSection"));

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
  const [isVisible, setIsVisible] = useState(index < 4); // render first 4 cards immediately
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index < 4) return; // skip observer for first 4

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div ref={ref}>
      {isVisible ? (
        <Suspense fallback={<ProductCardSkeleton />}>
          <ProductCard
            product={product}
            isNotLastColumn={isNotLastColumn}
            index={index} // Pass index to ProductCard
          />
        </Suspense>
      ) : (
        <ProductCardSkeleton />
      )}
    </div>
  );
};

const ProductsSection = () => {
  const [activeCategory, setActiveCategory] = useState("VIEW ALL");
  const { getProductsByCategory } = useProducts();
  const filteredProducts = getProductsByCategory(activeCategory);

  // Divide products into groups of 4
  const productGroups = [];
  for (let i = 0; i < filteredProducts.length; i += 4) {
    productGroups.push(filteredProducts.slice(i, i + 4));
  }

  return (
    <div className="pt-8 px-0 text-white bg-black">
      {/* Title and Tabs */}
      <Suspense fallback={<LoadingSkeleton />}>
        <ProductTitle />
      </Suspense>

      <Suspense fallback={<LoadingSkeleton />}>
        <CategoryTabs onCategoryChange={setActiveCategory} />
      </Suspense>

      {/* Products Groups with Parallax Dividers */}
      {productGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Products Grid Group */}
          <div className="mt-8 grid grid-cols-2 gap-x-0 lg:grid-cols-4">
            {group.map((product, index) => {
              const globalIndex = groupIndex * 4 + index;
              const isNotLastColumn =
                (index + 1) % 2 !== 0 && index !== group.length - 1;
              return (
                <LazyProductCard
                  key={product.id}
                  product={product}
                  isNotLastColumn={isNotLastColumn}
                  index={globalIndex}
                />
              );
            })}
          </div>

          {/* Parallax Divider (except after the last group) */}
          {groupIndex < productGroups.length - 1 && (
            <div className="my-16">
              <Suspense fallback={<div className="h-96 bg-gray-900 animate-pulse" />}>
                <ParallaxSection />
              </Suspense>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductsSection;
