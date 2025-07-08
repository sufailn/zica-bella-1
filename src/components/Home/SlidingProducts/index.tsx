"use client";
import { useState, useRef } from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "@/context/ProductContext";

const SlidingProducts = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { products: slidingProducts } = useProducts();

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-white mb-4">
            Featured Products
          </h2>
          <p className="text-gray-400 text-lg">
            Discover our latest collection
          </p>
        </div>

        {/* Sliding Container */}
        <div className="relative group ">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-40 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 rounded-full p-1 shadow transition-all duration-200"
            aria-label="Scroll left"
            style={{ width: 28, height: 28, display: showLeftArrow ? "block" : "none" }}
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-2 top-40 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 rounded-full p-1 shadow transition-all duration-200"
            aria-label="Scroll right"
            style={{ width: 28, height: 28, display: showRightArrow ? "block" : "none" }}
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Scrollable Products */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-0 overflow-x-auto scrollbar-hide pb-4 px-4 touch-pan-x"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {slidingProducts.map((product, index) => (
              <div key={product.id} className="flex-shrink-0 w-72">
                <ProductCard 
                  product={product} 
                  isNotLastColumn={index !== slidingProducts.length - 1}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicators */}
     
      </div>
    </div>
  );
};

export default SlidingProducts; 