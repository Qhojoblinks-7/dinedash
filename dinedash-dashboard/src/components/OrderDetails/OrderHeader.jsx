import React from 'react';

const OrderHeader = ({ tableNumber, orderType }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm mb-4">
      <h2 className="text-xl font-bold text-gray-800">Table {tableNumber}</h2>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold text-sm">
          {orderType}
        </button>
      </div>
    </div>
  );
};

export default OrderHeader;