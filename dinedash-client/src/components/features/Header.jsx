import React from 'react';
import { IoFastFoodSharp } from 'react-icons/io5';

const Header = ({ orderCount, onOpenCart = () => {} }) => {
  return (
  <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
  <button id="cart-button" type="button" onClick={onOpenCart} className="relative p-2 rounded-full bg-amber-400 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105 pointer-events-auto z-50" aria-label="Open cart" aria-expanded={false}>
          <IoFastFoodSharp className="h-6 w-6" />
          {orderCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {orderCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
