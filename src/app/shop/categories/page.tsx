"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Loader from "@/components/common/SplashScreen";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data.categories || []);
        setError(null);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (error) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar isHome={false} />
        <div className="pt-24 flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Unable to load categories</h2>
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
        <div className="max-w-7xl mx-auto px-4">
          {/* Page Header */}
          <div className="text-center py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
              Shop by Category
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore our complete collection organized by category. Find exactly what you're looking for.
            </p>
          </div>
          
          {/* Categories Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-white mb-2">No categories found</h3>
              <p className="text-gray-400">
                No product categories are currently available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop/category/${category.slug}`}
                  className="group bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gray-300 transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {category.description}
                      </p>
                    )}
                    <div className="mt-4 inline-flex items-center text-white text-sm font-medium group-hover:text-gray-300 transition-colors">
                      Shop {category.name}
                      <svg 
                        className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Back to Shop Link */}
          <div className="text-center pb-8">
            <Link
              href="/shop"
              className="inline-flex items-center text-white hover:text-gray-300 transition-colors"
            >
              <svg 
                className="mr-2 w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Products
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CategoriesPage; 