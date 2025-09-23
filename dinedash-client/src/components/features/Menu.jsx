// src/components/meals/Menu.jsx
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

  // Filter meals based on category and search
  const filteredMeals = useMemo(() => {
    let filtered = meals;

    // Category filter
    if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'burgers':
          filtered = filtered.filter(meal => meal.name?.toLowerCase().includes('burger'));
          break;
        case 'soups':
          filtered = filtered.filter(meal => meal.name?.toLowerCase().includes('soup'));
          break;
        case 'breakfast':
          filtered = filtered.filter(meal =>
            meal.name?.toLowerCase().includes('breakfast') ||
            meal.name?.toLowerCase().includes('egg') ||
            meal.name?.toLowerCase().includes('pancake')
          );
          break;
        case 'main':
          filtered = filtered.filter(meal =>
            !meal.name?.toLowerCase().includes('soup') &&
            !meal.name?.toLowerCase().includes('burger') &&
            !meal.name?.toLowerCase().includes('breakfast') &&
            !meal.name?.toLowerCase().includes('pasta') &&
            !meal.name?.toLowerCase().includes('drink') &&
            !meal.name?.toLowerCase().includes('dessert')
          );
          break;
        case 'pasta':
          filtered = filtered.filter(meal =>
            meal.name?.toLowerCase().includes('pasta') ||
            meal.name?.toLowerCase().includes('spaghetti')
          );
          break;
        case 'drinks':
          filtered = filtered.filter(meal =>
            meal.name?.toLowerCase().includes('drink') ||
            meal.name?.toLowerCase().includes('juice') ||
            meal.name?.toLowerCase().includes('soda')
          );
          break;
        case 'desserts':
          filtered = filtered.filter(meal =>
            meal.name?.toLowerCase().includes('cake') ||
            meal.name?.toLowerCase().includes('ice cream') ||
            meal.name?.toLowerCase().includes('dessert')
          );
          break;
        case 'sides':
          filtered = filtered.filter(meal =>
            meal.name?.toLowerCase().includes('fries') ||
            meal.name?.toLowerCase().includes('salad') ||
            meal.name?.toLowerCase().includes('side')
          );
          break;
        case 'specials':
          filtered = filtered.filter(meal =>
            meal.name?.toLowerCase().includes('special') ||
            meal.name?.toLowerCase().includes('featured')
          );
          break;
        default:
          break;
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(meal =>
        meal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
        {loading ? (
          <div className="text-center py-12 text-lg text-gray-500">
            Loading meals...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Failed to load meals: {error}
          </div>
        ) : filteredMeals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? `No meals found for "${searchQuery}"` : 'No meals available in this category'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeals.map((meal) => (
              <MealCard key={meal.id} {...meal} onAdd={() => handleAdd(meal)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
