"use client";
import { useState, lazy, Suspense, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useProducts } from "@/context/ProductContext";
import Loader from "@/components/common/SplashScreen";

// Lazy load components
const ProductCard = lazy(() => import("@/components/Home/ProductSection/ProductCard"));
const CategoryBreadcrumb = lazy(() => import("@/components/Shop/CategoryBreadcrumb"));

// Loading fallback components
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-black rounded mb-4"></div>
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

const CategoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryDescription, setCategoryDescription] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getProductsByCategory, loading: productsLoading, error: productsError } = useProducts();

  const slug = params.slug as string;

  // Fetch category details
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        const category = data.categories.find((cat: any) => cat.slug === slug);
        
        if (!category) {
          setError('Category not found');
          return;
        }
        
        setCategoryName(category.name);
        setCategoryDescription(category.description || '');
        setError(null);
      } catch (err) {
        setError('Failed to load category details');
        console.error('Error fetching category:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryDetails();
    }
  }, [slug]);

  // Get filtered products for this category
  // Try to match by category name first, then by slug mapping
  let filteredProducts = getProductsByCategory(categoryName);
  
  // If no products found, try to map category name to common product categories
  if (filteredProducts.length === 0 && categoryName) {
    const categoryMapping: { [key: string]: string[] } = {
      'T-Shirts': ['tshirts', 't-shirts', 't-shirt', 'tshirt'],
      'Shirts': ['shirts', 'shirt'],
      'Jeans': ['jeans', 'jean', 'denim']
    };
    
    const mappedCategories = categoryMapping[categoryName] || [];
    for (const mappedCategory of mappedCategories) {
      const mappedProducts = getProductsByCategory(mappedCategory);
      if (mappedProducts.length > 0) {
        filteredProducts = mappedProducts;
        console.log(`Found products using mapped category: ${mappedCategory}`);
        break;
      }
    }
  }
  


  if (error) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar isHome={false} />
        <div className="pt-24 flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => router.push('/shop')}
              className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Back to Shop
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar isHome={false} />
        <div className="pt-24 flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Unable to load products</h2>
            <p className="text-gray-400 mb-4">{productsError}</p>
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
          {/* Breadcrumb */}
          {!loading && categoryName && (
            <Suspense fallback={<div className="h-4 bg-gray-800 rounded mb-4 mx-4" />}>
              <CategoryBreadcrumb categoryName={categoryName} />
            </Suspense>
          )}
          
          {/* Category Header */}
          <div className="text-center px-4 py-8">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-800 rounded mb-4 mx-auto w-48"></div>
                <div className="h-4 bg-gray-800 rounded mx-auto w-96"></div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
                  {categoryName}
                </h1>
                {categoryDescription && (
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    {categoryDescription}
                  </p>
                )}
              </>
            )}
          </div>
          
          {/* Products Grid */}
          {productsLoading ? (
            <div className="mt-8 flex items-center justify-center py-16">
              <Loader />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="mt-8 text-center py-16">
              <h3 className="text-xl font-medium text-white mb-2">No products found</h3>
              <p className="text-gray-400">
                No products are currently available in the {categoryName} category.
              </p>
              <button 
                onClick={() => router.push('/shop')}
                className="mt-4 bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition"
              >
                View All Products
              </button>
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

export default CategoryPage; 