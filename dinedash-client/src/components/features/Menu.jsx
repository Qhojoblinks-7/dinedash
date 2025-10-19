import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MealCard from './meals/MealCard';
import MenuHeader from './MenuHeader';
import { fetchMeals } from '../../store/mealsSlice';
import { useToast } from '../ui/toastContext';

const Menu = ({ onAdd, orderCount, onOpenCart }) => {
  const dispatch = useDispatch();
  const { meals, loading, error } = useSelector((state) => state.meals);
  const { addToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMeals());
  }, [dispatch]);

  const categoryFilters = {
    burgers: (meal) => meal.name?.toLowerCase().includes('burger'),
    soups: (meal) => meal.name?.toLowerCase().includes('soup'),
    breakfast: (meal) => ['breakfast', 'egg', 'pancake'].some(keyword => meal.name?.toLowerCase().includes(keyword)),
    main: (meal) => !['soup', 'burger', 'breakfast', 'pasta', 'drink', 'dessert'].some(keyword => meal.name?.toLowerCase().includes(keyword)),
    pasta: (meal) => ['pasta', 'spaghetti'].some(keyword => meal.name?.toLowerCase().includes(keyword)),
    drinks: (meal) => ['drink', 'juice', 'soda'].some(keyword => meal.name?.toLowerCase().includes(keyword)),
    desserts: (meal) => ['cake', 'ice cream', 'dessert'].some(keyword => meal.name?.toLowerCase().includes(keyword)),
    sides: (meal) => ['fries', 'salad', 'side'].some(keyword => meal.name?.toLowerCase().includes(keyword)),
    specials: (meal) => ['special', 'featured'].some(keyword => meal.name?.toLowerCase().includes(keyword)),
  };

  const filteredMeals = useMemo(() => {
    let filtered = Array.isArray(meals) ? meals : [];

    if (selectedCategory !== 'all' && categoryFilters[selectedCategory]) {
      filtered = filtered.filter(categoryFilters[selectedCategory]);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meal =>
        meal.name?.toLowerCase().includes(query) ||
        meal.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [meals, selectedCategory, searchQuery]);

  const handleAdd = (meal) => {
    addToast({ type: 'success', title: 'Added', message: `${meal.name} added to your order` });
    if (onAdd) onAdd(meal);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-lg text-gray-500">
        Loading meals...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-red-500">
        Failed to load meals: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 bg-gray-50">
      <MenuHeader
        meals={meals}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        orderCount={orderCount}
        onOpenCart={onOpenCart}
        isSearchExpanded={isSearchExpanded}
        setIsSearchExpanded={setIsSearchExpanded}
        isCategoriesOpen={isCategoriesOpen}
        setIsCategoriesOpen={setIsCategoriesOpen}
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
      />

      <div className="container mx-auto px-4 py-8">
        {filteredMeals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? `No meals found for "${searchQuery}"` : 'No meals available in this category'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeals.map((meal) => (
              <MealCard key={meal.id} {...meal} readyInMinutes={meal.prep_time} onAdd={() => handleAdd(meal)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
