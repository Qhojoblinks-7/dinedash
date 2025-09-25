import React, { useState } from 'react';
import {
  MagnifyingGlassIcon as SearchIcon,
  BellIcon,
  SparklesIcon,
  ShoppingBagIcon,
  CakeIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import CategoryPill from './CategoryPill';

const categoryIcons = {
  'all': <SparklesIcon />,
  'main course': <ShoppingBagIcon />,
  'desserts': <CakeIcon />,
  'drinks': <BeakerIcon />,
  // Add more icons for your categories
};

const DUMMY_CATEGORIES = [
  { id: 'cat_1', name: 'All', count: 124 },
  { id: 'cat_2', name: 'Main Course', count: 45 },
  { id: 'cat_3', name: 'Desserts', count: 22 },
  { id: 'cat_4', name: 'Drinks', count: 57 },
];

const MainHeader = () => {
  const [activeCategory, setActiveCategory] = useState('cat_1');

  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed w-full top-0 left-64 right-96 bg-gray-50 p-6 flex flex-col z-10">
      {/* Top Row: Search & Date */}
      <div className="flex items-center justify-between mb-4">
        {/* Left Section: Search Bar */}
        <div className="flex items-center space-x-2 w-1/3">
          <SearchIcon className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            className="bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none w-full"
          />
        </div>

        {/* Right Section: Date & Notification Icon */}
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-semibold text-gray-600">{currentDate}</h3>
          <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <BellIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Category Filter */}
      <div className="flex items-center gap-4 overflow-x-auto">
        {DUMMY_CATEGORIES.map((category) => (
          <CategoryPill
            key={category.id}
            icon={categoryIcons[category.name.toLowerCase()]}
            name={category.name}
            count={category.count}
            isActive={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MainHeader;