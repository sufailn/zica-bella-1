'use client';

import { useState } from 'react';
import { useProducts } from '@/context/ProductContext';

interface CategoryTabsProps {
  onCategoryChange?: (category: string) => void;
}

const CategoryTabs = ({ onCategoryChange }: CategoryTabsProps) => {
  const [activeTab, setActiveTab] = useState('VIEW ALL');
  const { categories, loading } = useProducts();

  // Combine "VIEW ALL" with categories from database
  const allCategories = ['VIEW ALL', ...categories];

  const handleTabClick = (category: string) => {
    setActiveTab(category);
    onCategoryChange?.(category);
  };

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
    <div className="w-full border-b border-gray-800 ">
      <nav className="flex overflow-x-auto  scrollbar-hide">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => handleTabClick(category)}
            className={`
              relative px-4 py-3 w-32 text-sm font-medium whitespace-nowrap transition-colors duration-200
              ${activeTab === category
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-gray-900'
              }
            `}
          >
            {category}
            {activeTab === category && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CategoryTabs;