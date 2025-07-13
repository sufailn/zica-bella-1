"use client";
import { useState, lazy, Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useProducts } from "@/context/ProductContext";
import Loader from "@/components/common/SplashScreen";

// Lazy load components
const CategoryTabs = lazy(() => import("@/components/Home/ProductSection/CategoryTabs"));
const CategoryLinks = lazy(() => import("@/components/Shop/CategoryLinks"));
const ProductCard = lazy(() => import("@/components/Home/ProductSection/ProductCard"));

// Loading fallback components
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-black rounded mb-4"></div>
  </div>
);

const ShopTitle = () => (
  <div className="text-center px-4 py-8">
    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
      Shop All
    </h1>
    <p className="text-gray-400 max-w-2xl mx-auto mb-6">
      Discover our complete collection of premium clothing and accessories
    </p>
    <div className="flex justify-center">
      <Link
        href="/shop/categories"
        className="inline-flex items-center text-white hover:text-gray-300 transition-colors text-sm"
      >
        <svg 
          className="mr-2 w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Browse by Category
      </Link>
    </div>
  </div>
);

// Lazy wrapper for ProductCard with intersection observer
const LazyProductCard = ({ product, isNotLastColumn, index }: any) => {
  return (
    <Suspense fallback={<div className="h-80 bg-gray-900 animate-pulse" />}>
      <ProductCard 
        product={product} 
        isNotLastColumn={isNotLastColumn}
        index={index}
      />
    </Suspense>
  );
};

const ShopPage = () => {
  const [activeCategory, setActiveCategory] = useState('VIEW ALL');
  const { getProductsByCategory, loading, error } = useProducts();

  // Get filtered products from context
  const filteredProducts = getProductsByCategory(activeCategory);

  if (error) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar isHome={false} />
        <div className="pt-24 flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Unable to load products</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <Navbar isHome={false} />
      
      <div className="pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Shop Title */}
          <ShopTitle />
          
          {/* Category Navigation */}
          <Suspense fallback={<LoadingSkeleton />}>
            <CategoryLinks />
          </Suspense>
          
          {/* Category Tabs for filtering */}
          <Suspense fallback={<LoadingSkeleton />}>
            <CategoryTabs onCategoryChange={setActiveCategory} />
          </Suspense>
          
          {/* Products Grid */}
          {loading ? (
            <div className="mt-8 flex items-center justify-center py-16">
              <Loader />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="mt-8 text-center py-16">
              <h3 className="text-xl font-medium text-white mb-2">No products found</h3>
              <p className="text-gray-400">
                {activeCategory === 'VIEW ALL' 
                  ? 'No products are currently available.' 
                  : `No products found in the ${activeCategory} category.`
                }
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 mb-16">
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
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ShopPage;