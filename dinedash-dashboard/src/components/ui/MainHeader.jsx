import React from 'react';
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

const MainHeader = ({ searchQuery, onSearchChange, categories, selectedCategory, onCategoryChange, onAddMeal }) => {
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
            placeholder="Search meals or orders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none w-full"
          />
        </div>

        {/* Center Section: Add Meal Button */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={onAddMeal}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Add New Meal
          </button>
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
        {categories.map((category) => (
          <CategoryPill
            key={category.id}
            icon={categoryIcons[category.name.toLowerCase()]}
            name={category.name}
            count={category.count}
            isActive={selectedCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MainHeader;