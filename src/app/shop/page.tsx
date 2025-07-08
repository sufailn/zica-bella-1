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
    <div className="h-8 bg-black rounded mb-4"></div>
  </div>
);

const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-black rounded mb-4"></div>
    <div className="h-4 bg-black rounded mb-2"></div>
    <div className="h-4 bg-black rounded w-1/2"></div>
  </div>
);

// Shop Title Component
const ShopTitle = () => {
  return (
    <div className="mb-8 md:mb-12 px-4 bg-black">
      <div className="relative bg-black p-4 md:p-8">
        <div className="absolute inset-2 md:inset-4 border-2 border-dotted border-gray-200"></div>
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              SHOP<br />
              COLLECTION
            </h1>
          </div>
          
          <div className="text-left sm:text-right">
            <p className="text-base sm:text-lg md:text-xl font-medium text-gray-200 tracking-widest font-numbers">
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
          <ProductCard product={product} isNotLastColumn={isNotLastColumn} index={index} />
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
      name: "CLASSIC WHITE TEE",
      price: 1200,
      images: [
        "/shop/products/tshirt-1/p (1).jpeg",
        "/shop/products/tshirt-1/p (2).jpeg",
        "/shop/products/tshirt-1/p (3).jpeg",
        "/shop/products/tshirt-1/p (4).jpeg"
      ],
      category: "T-SHIRTS",
      soldOut: false
    },
    {
      id: 2,
      name: "STRIPED GRAPHIC TEE",
      price: 1400,
      images: [
        "/shop/products/tshirt-2/p (1).jpeg",
        "/shop/products/tshirt-2/p (2).jpeg",
        "/shop/products/tshirt-2/p (3).jpeg",
        "/shop/products/tshirt-2/p (4).jpeg"
      ],
      category: "T-SHIRTS",
      soldOut: false
    },
    {
      id: 3,
      name: "PREMIUM COTTON TEE",
      price: 1600,
      images: [
        "/shop/products/tshirt-3/p (1).jpeg",
        "/shop/products/tshirt-3/p (2).jpeg",
        "/shop/products/tshirt-3/p (3).jpeg",
        "/shop/products/tshirt-3/p (4).jpeg"
      ],
      category: "T-SHIRTS",
      soldOut: true
    },
    {
      id: 4,
      name: "MINIMALIST TEE",
      price: 1100,
      images: [
        "/shop/products/tshirt-4/p.jpeg"
      ],
      category: "T-SHIRTS",
      soldOut: false
    },
    {
      id: 5,
      name: "LINEN CASUAL SHIRT",
      price: 2200,
      images: [
        "/shop/products/shirt-1/p (1).jpeg",
        "/shop/products/shirt-1/p (2).jpeg",
        "/shop/products/shirt-1/p (3).jpeg"
      ],
      category: "SHIRTS",
      soldOut: false
    },
    {
      id: 6,
      name: "FORMAL OXFORD SHIRT",
      price: 2500,
      images: [
        "/shop/products/shirt-2/p (1).jpeg",
        "/shop/products/shirt-2/p (2).jpeg",
        "/shop/products/shirt-2/p (3).jpeg",
        "/shop/products/shirt-2/p (4).jpeg"
      ],
      category: "SHIRTS",
      soldOut: false
    },
    {
      id: 7,
      name: "PREMIUM DENIM JEANS",
      price: 3200,
      images: [
        "/shop/products/jeans-1/p (1).jpeg",
        "/shop/products/jeans-1/p (2).jpeg",
        "/shop/products/jeans-1/p (3).jpeg"
      ],
      category: "JEANS",
      soldOut: false
    }
  ];

  const filteredProducts = activeCategory === 'VIEW ALL' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <div className="bg-black min-h-screen">
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