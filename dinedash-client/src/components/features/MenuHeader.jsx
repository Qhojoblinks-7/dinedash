import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  Hamburger,
  Soup,
  EggFried,
  ChefHat,
  Wheat,
  Wine,
  Cake,
  Salad,
  Star,
  Search,
  SlidersHorizontal,
  Menu,
  X
} from 'lucide-react';
import { IoFastFoodSharp } from 'react-icons/io5';
// HeaderWithControls component - combines main header with mobile controls
const HeaderWithControls = ({
  orderCount,
  onOpenCart,
  isSearchExpanded,
  setIsSearchExpanded,
  isCategoriesOpen,
  setIsCategoriesOpen,
  searchQuery,
  handleSearchChange,
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  const handleCategoryClick = (categoryId) => {
    onCategoryChange(categoryId);
    setIsCategoriesOpen(false);
  };

  return (
    <>
      {/* Main Header - Fixed at top */}
      <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="hidden lg:block text-2xl font-bold text-gray-800">DineDash</h1>

          {/* Desktop Cart Button */}
          <button
            id="cart-button"
            type="button"
            onClick={onOpenCart}
            className="relative p-2 rounded-full bg-amber-400 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105 pointer-events-auto z-50"
            aria-label="Open cart"
            aria-expanded={false}
          >
            <IoFastFoodSharp className="h-6 w-6" />
            {orderCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {orderCount}
              </span>
            )}
          </button>

          {/* Mobile Controls - Only visible on small screens */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className={`
                p-2 rounded-lg transition-all duration-300
                ${isSearchExpanded
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }
              `}
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Mobile Categories Menu */}
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className={`
                p-2 rounded-lg border transition-all duration-300
                ${isCategoriesOpen
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }
              `}
              aria-label="Toggle categories menu"
            >
              {isCategoriesOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchExpanded && (
          <div className="fixed top-20 left-0 right-0 z-40 lg:hidden">
            <div className="bg-white border-b border-gray-200 shadow-lg animate-fade-in">
              <div className="py-4 px-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search meals..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Categories Overlay */}
      <AnimatePresence>
        {isCategoriesOpen && (
          <div className={`fixed left-0 right-0 z-30 lg:hidden ${isSearchExpanded ? 'top-32' : 'top-20'}`}>
            <div className="bg-white border-b border-gray-200 shadow-lg animate-fade-in">
              <div className="py-4 px-4">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 animate-slide-in-left">
                  {categories.map((category, index) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`
                          menu-category-item flex flex-col items-center gap-2 px-4 py-3 rounded-xl flex-shrink-0 min-w-[80px] transition-transform duration-200 hover:scale-105
                          ${selectedCategory === category.id ? 'active' : ''}
                        `}
                        aria-pressed={selectedCategory === category.id}
                        style={{
                          animationDelay: `${index * 0.05}s`
                        }}
                      >
                        <IconComponent className="h-6 w-6" />
                        <span className="text-sm font-medium text-center">{category.label}</span>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-semibold
                          ${selectedCategory === category.id
                            ? 'bg-green-200 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                          }
                        `}>
                          {category.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const MenuHeader = ({
  meals,
  selectedCategory,
  onCategoryChange,
  orderCount,
  onOpenCart,
  isSearchExpanded,
  setIsSearchExpanded,
  isCategoriesOpen,
  setIsCategoriesOpen,
  searchQuery,
  handleSearchChange
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Define categories with icons and count logic
  const categories = [
    {
      id: 'all',
      label: 'All',
      icon: UtensilsCrossed,
      count: meals.length
    },
    {
      id: 'burgers',
      label: 'Burgers',
      icon: Hamburger,
      count: meals.filter(meal => meal.name?.toLowerCase().includes('burger')).length
    },
    {
      id: 'soups',
      label: 'Soups',
      icon: Soup,
      count: meals.filter(meal => meal.name?.toLowerCase().includes('soup')).length
    },
    {
      id: 'breakfast',
      label: 'Breakfast',
      icon: EggFried,
      count: meals.filter(meal => meal.name?.toLowerCase().includes('breakfast') ||
                                 meal.name?.toLowerCase().includes('egg') ||
                                 meal.name?.toLowerCase().includes('pancake')).length
    },
    {
      id: 'main',
      label: 'Main Course',
      icon: ChefHat,
      count: meals.filter(meal => !meal.name?.toLowerCase().includes('soup') &&
                                 !meal.name?.toLowerCase().includes('burger') &&
                                 !meal.name?.toLowerCase().includes('breakfast') &&
                                 !meal.name?.toLowerCase().includes('pasta') &&
                                 !meal.name?.toLowerCase().includes('drink') &&
                                 !meal.name?.toLowerCase().includes('dessert')).length
    },
    {
      id: 'pasta',
      label: 'Pasta',
      icon: Wheat,
      count: meals.filter(meal => meal.name?.toLowerCase().includes('pasta') ||
                                 meal.name?.toLowerCase().includes('spaghetti')).length
    },
    {
      id: 'drinks',
      label: 'Drinks',
      icon: Wine,
      count: meals.filter(meal => meal.name?.toLowerCase().includes('drink') ||
                                 meal.name?.toLowerCase().includes('juice') ||
                                 meal.name?.toLowerCase().includes('soda')).length
    },
    {
      id: 'desserts',
      label: 'Desserts',
      icon: Cake,
      count: meals.filter(meal => meal.name?.toLowerCase().includes('cake') ||
                                 meal.name?.toLowerCase().includes('ice cream') ||
                                 meal.name?.toLowerCase().includes('dessert')).length
    },
    {
      id: 'sides',
      label: 'Sides',
      icon: Salad,
      count: meals.filter(meal => meal.name?.toLowerCase().includes('fries') ||
                                 meal.name?.toLowerCase().includes('salad') ||
                                 meal.name?.toLowerCase().includes('side')).length
    },
    {
      id: 'specials',
      label: 'Specials',
      icon: Star,
      count: meals.filter(meal => meal.name?.toLowerCase().includes('special') ||
                                 meal.name?.toLowerCase().includes('featured')).length
    }
  ];

  const handleCategoryClick = (categoryId) => {
    onCategoryChange(categoryId);
    setIsCategoriesOpen(false); // Close mobile categories menu
  };

  return (
    <>
      {/* Header with Mobile Controls */}
      <HeaderWithControls
        orderCount={orderCount}
        onOpenCart={onOpenCart}
        isSearchExpanded={isSearchExpanded}
        setIsSearchExpanded={setIsSearchExpanded}
        isCategoriesOpen={isCategoriesOpen}
        setIsCategoriesOpen={setIsCategoriesOpen}
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />

      {/* Menu Header - Sticky below main header */}
      <div className={`sticky z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm ${isSearchExpanded ? 'top-32' : 'top-24'}`}>
        {/* Desktop Layout (≥1024px) */}
        <div className="hidden lg:block">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-6">
              {/* Categories - Horizontal Auto-Scroll */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-6 animate-scroll-loop">
                  {[...categories, ...categories].map((category, index) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={`${category.id}-${index}`}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`
                          menu-category-item flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap transition-transform duration-200 hover:scale-105
                          ${selectedCategory === category.id ? 'active' : ''}
                        `}
                        aria-pressed={selectedCategory === category.id}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="font-medium">{category.label}</span>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-semibold
                          ${selectedCategory === category.id
                            ? 'bg-green-200 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                          }
                        `}>
                          {category.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search meals..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`
                    p-3 rounded-lg border transition-all duration-300
                    ${isFilterOpen
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                    }
                  `}
                  aria-label="Toggle filters"
                >
                  <SlidersHorizontal className={`h-5 w-5 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default MenuHeader;