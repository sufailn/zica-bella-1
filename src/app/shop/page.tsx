"use client";
import { useState, lazy, Suspense, useEffect, useRef } from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

// Lazy load components
const CategoryTabs = lazy(() => import("@/components/Home/ProductSection/CategoryTabs"));
const ProductCard = lazy(() => import("@/components/Home/ProductSection/ProductCard"));

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

// Shop Title Component
const ShopTitle = () => {
  return (
    <div className="mb-8 md:mb-12 px-4">
      <div className="relative bg-gray-100 p-4 md:p-8">
        <div className="absolute inset-2 md:inset-4 border-2 border-dotted border-gray-400"></div>
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black leading-tight">
              SHOP<br />
              COLLECTION
            </h1>
          </div>
          
          <div className="text-left sm:text-right">
            <p className="text-base sm:text-lg md:text-xl font-medium text-gray-600 tracking-widest font-numbers">
              ALL<br />
              ITEMS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const ShopPage = () => {
  const [activeCategory, setActiveCategory] = useState('VIEW ALL');

  // Extended product data for shop page
  const products = [
    {
      id: 1,
      name: "AVOINE HOODED QUILTED JACKET",
      price: 1500,
      images: ["/shop/image1.jpeg", "/shop/image2.jpeg", "/shop/image4.jpeg", "/shop/image5.jpeg"],
      category: "JACKETS",
      soldOut: false
    },
    {
      id: 2,
      name: "PREMIUM QUILTED JACKET",
      price: 1600,
      images: ["/shop/image2.jpeg", "/shop/image3.jpeg", "/shop/image1.jpeg"],
      category: "JACKETS",
      soldOut: true
    },
    {
      id: 3,
      name: "CLASSIC BUTTON SHIRT",
      price: 800,
      images: ["/shop/image1.jpeg", "/shop/image2.jpeg"],
      category: "SHIRTS",
      soldOut: false
    },
    {
      id: 4,
      name: "OVERSIZED GRAPHIC TEE",
      price: 600,
      images: ["/shop/image2.jpeg", "/shop/image4.jpeg"],
      category: "SHIRTS",
      soldOut: true
    },
    {
      id: 5,
      name: "SLIM FIT DENIM JEANS",
      price: 1200,
      images: ["/shop/image4.jpeg", "/shop/image5.jpeg"],
      category: "PANTS",
      soldOut: false
    },
    {
      id: 6,
      name: "CARGO SUMMER SHORTS",
      price: 700,
      images: ["/shop/image6.jpeg", "/shop/image3.jpeg"],
      category: "PANTS",
      soldOut: false
    },
    {
      id: 7,
      name: "PREMIUM WOOL SWEATER",
      price: 1100,
      images: ["/shop/image6.jpeg", "/shop/image2.jpeg", "/shop/image4.jpeg"],
      category: "SHIRTS",
      soldOut: true
    },
    {
      id: 8,
      name: "CASUAL POLO SHIRT",
      price: 900,
      images: ["/shop/image2.jpeg", "/shop/image6.jpeg", "/shop/image1.jpeg"],
      category: "SHIRTS",
      soldOut: false
    },
    {
      id: 9,
      name: "LEATHER CROSSBODY BAG",
      price: 2200,
      images: ["/shop/image3.jpeg", "/shop/image5.jpeg"],
      category: "ACCESSORIES",
      soldOut: false
    },
    {
      id: 10,
      name: "DESIGNER SUNGLASSES",
      price: 450,
      images: ["/shop/image5.jpeg", "/shop/image1.jpeg"],
      category: "ACCESSORIES",
      soldOut: true
    },
    {
      id: 11,
      name: "PREMIUM SNEAKERS",
      price: 1800,
      images: ["/shop/image4.jpeg", "/shop/image6.jpeg"],
      category: "SHOES",
      soldOut: false
    },
    {
      id: 12,
      name: "CLASSIC OXFORD SHOES",
      price: 2500,
      images: ["/shop/image1.jpeg", "/shop/image3.jpeg"],
      category: "SHOES",
      soldOut: false
    }
  ];

  const filteredProducts = activeCategory === 'VIEW ALL' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <div className="bg-white min-h-screen">
      <Navbar isHome={false} />
      
      <div className="pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Shop Title */}
          <ShopTitle />
          
          {/* Category Tabs */}
          <Suspense fallback={<LoadingSkeleton />}>
            <CategoryTabs onCategoryChange={setActiveCategory} />
          </Suspense>
          
          {/* Products Grid */}
          <div className="mt-8  grid grid-cols-2 g lg:grid-cols-4 mb-16">
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
      </div>
      
      <Footer />
    </div>
  );
};

export default ShopPage;