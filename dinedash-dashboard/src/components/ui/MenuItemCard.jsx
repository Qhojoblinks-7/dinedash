import React from 'react';
import { Leaf, Beef } from 'lucide-react';

const MenuItemCard = ({
  name,
  image,
  price,
  description,
  isVeg = false,
  isAvailable = true,
  quantity = 0
}) => {
  return (
    <div className={`relative w-full max-w-xs sm:max-w-none rounded-xl shadow-lg bg-white overflow-hidden ${!isAvailable ? 'opacity-50 grayscale' : ''}`}>
      {/* Product Image */}
      <div className="w-full h-40">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-t-xl"
        />
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col items-start">
        {/* Name and Price */}
        <div className="flex items-center justify-between w-full mb-1">
          <h3 className=" sm:text-md  font-bold text-gray-900 leading-snug">
            {name}
          </h3>
          <span className="sm:text-md  font-bold text-gray-900 font-bold text-green-600">
            ${price.toFixed(2)}
          </span>
        </div>
        
        {/* Description */}
        <p className="font-poppins text-sm text-gray-500 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Veg/Non-Veg Indicator and Quantity Display */}
        <div className="flex items-center justify-between w-full font-poppins">
            <div className="flex items-center gap-1 text-sm font-medium">
              {isVeg ? (
                <>
                  <Leaf className="text-green-500 w-4 h-4" />
                  <span className="text-gray-600">Veg</span>
                </>
              ) : (
                <>
                  <Beef className="text-red-500 w-4 h-4" />
                  <span className="text-gray-600">Non Veg</span>
                </>
              )}
            </div>
            {isAvailable && (
                <div className="text-lg font-bold text-gray-900">
                    <span className="text-sm font-normal text-gray-500">Ordered: </span>{quantity}
                </div>
            )}
        </div>
      </div>
      
      {/* Sold Out/Unavailable Overlay */}
      {!isAvailable && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70 rounded-xl font-poppins">
          <span className="text-white text-2xl font-bold">Out of Stock</span>
        </div>
      )}
    </div>
  );
};

export default MenuItemCard;