"use client";
import { useState, lazy, Suspense } from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useProducts } from "@/context/ProductContext";

// Lazy load components
const CategoryTabs = lazy(() => import("@/components/Home/ProductSection/CategoryTabs"));
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
    <p className="text-gray-400 max-w-2xl mx-auto">
      Discover our complete collection of premium clothing and accessories
    </p>
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
          
          {/* Category Tabs */}
          <Suspense fallback={<LoadingSkeleton />}>
            <CategoryTabs onCategoryChange={setActiveCategory} />
          </Suspense>
          
          {/* Products Grid */}
          {loading ? (
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16 px-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-80 bg-gray-900 animate-pulse rounded-lg" />
              ))}
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