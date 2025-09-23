// src/components/CartHeader.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';

const CartHeader = ({ tableNo, customerName, orderType, onOrderTypeChange }) => {
  const types = ['Dine in', 'Take Away', 'Delivery'];

  return (
    <div className="p-3 sm:p-4 bg-white sticky top-0 z-10 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{tableNo}</h1>
          <p className="text-xs sm:text-sm text-gray-500">{customerName}</p>
        </div>
        <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors" aria-label="Edit details">
          <FontAwesomeIcon icon={faPencilAlt} className="text-sm sm:text-base" />
        </button>
      </div>

      {/* Segmented control for order type */}
      <div className="flex bg-gray-100 p-1 rounded-full text-sm sm:text-base">
        {types.map((type) => (
          <button
            key={type}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-full transition-colors font-medium text-xs sm:text-sm ${
              orderType === type ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => onOrderTypeChange(type)}
            aria-pressed={orderType === type}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CartHeader;