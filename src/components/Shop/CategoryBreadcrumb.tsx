'use client';

import Link from 'next/link';

interface CategoryBreadcrumbProps {
  categoryName: string;
}

const CategoryBreadcrumb = ({ categoryName }: CategoryBreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4 px-4">
      <Link
        href="/shop"
        className="hover:text-white transition-colors"
      >
        Shop
      </Link>
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <Link
        href="/shop/categories"
        className="hover:text-white transition-colors"
      >
        Categories
      </Link>
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <span className="text-white">{categoryName}</span>
    </nav>
  );
};

export default CategoryBreadcrumb; 