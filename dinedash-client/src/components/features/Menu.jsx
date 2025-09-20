import React from 'react';
import MealCard from './MealCard';

const sampleMeals = [
  {
    id: 1,
    name: 'Spicy Garlic Noodles',
    description: 'Wok-tossed egg noodles with fiery chili-garlic sauce, tender shrimp, and fresh vegetables.',
    price: 18.99,
    image: '/vite.svg',
    available: true,
    readyInMinutes: 18,
  },
  {
    id: 2,
    name: 'Grilled Chicken Bowl',
    description: 'Juicy grilled chicken served with seasoned rice and vegetables.',
    price: 14.5,
    image: '/public/vite.svg',
    available: false,
    readyInMinutes: null,
  },
  {
    id: 3,
    name: 'Vegan Buddha Bowl',
    description: 'A nourishing bowl of quinoa, chickpeas, avocado, and fresh veggies with a tahini dressing.',
    price: 12.75,
    image: '/vite.svg',
    available: true,
    readyInMinutes: 12,
  },
  {
    id: 4,
    name: 'Classic Cheeseburger',
    description: 'A juicy beef patty topped with melted cheese, lettuce, tomato, and our special sauce.',
    price: 11.99,
    image: '/vite.svg',
    available: true,
    readyInMinutes: 15,
  }
];

const Menu = ({ onAdd = () => {} }) => {

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sampleMeals.map((m) => (
          <MealCard key={m.id} {...m} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
};

export default Menu;
