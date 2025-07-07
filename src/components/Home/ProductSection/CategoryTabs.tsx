'use client';

import { useState } from 'react';

interface CategoryTabsProps {
  onCategoryChange?: (category: string) => void;
}

const CategoryTabs = ({ onCategoryChange }: CategoryTabsProps) => {
  const [activeTab, setActiveTab] = useState('VIEW ALL');

  const categories = [
    'VIEW ALL',
    'T-SHIRTS',
    'SHIRTS',
    'JEANS',
    'SHOES',
    'ACCESSORIES'
  ];

  const handleTabClick = (category: string) => {
    setActiveTab(category);
    onCategoryChange?.(category);
  };

  return (
    <div className="w-full border-b border-gray-800 ">
      <nav className="flex overflow-x-auto  scrollbar-hide">
        {categories.map((category) => (
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