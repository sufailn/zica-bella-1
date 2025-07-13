'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface CategoryLinksProps {
  showAllProducts?: boolean;
}

const CategoryLinks = ({ showAllProducts = true }: CategoryLinksProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories: productCategories } = useProducts();

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
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="w-full border-b border-gray-800">
        <nav className="flex overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-24 h-8 bg-gray-800 rounded animate-pulse"
              />
            ))}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="w-full border-b border-gray-800">
      <nav className="flex overflow-x-auto scrollbar-hide">
        {showAllProducts && (
          <Link
            href="/shop"
            className="relative px-4 py-3 w-32 text-sm font-medium whitespace-nowrap transition-colors duration-200 text-gray-400 hover:text-gray-900"
          >
            VIEW ALL
          </Link>
        )}
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop/category/${category.slug}`}
            className="relative px-4 py-3 w-32 text-sm font-medium whitespace-nowrap transition-colors duration-200 text-gray-400 hover:text-gray-900"
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default CategoryLinks; 