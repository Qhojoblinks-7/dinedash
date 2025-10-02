import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const OrderedItem = ({ item, onRemove }) => {
  const price = parseFloat(item.unit_price) || 0;
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        {/* Placeholder for item image */}
        <div className="w-10 h-10 rounded-md bg-gray-200 flex-shrink-0"></div>
        <div>
          <h3 className="text-sm font-semibold">{item.item_name}</h3>
          <p className="text-xs text-gray-500">
            <span>{item.quantity} x ${price.toFixed(2)}</span>
            <span className="ml-2 font-bold text-gray-800">${(item.quantity * price).toFixed(2)}</span>
          </p>
        </div>
      </div>
      <button onClick={() => onRemove(item.meal)} className="text-red-500 hover:text-red-700">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default OrderedItem;