import React from 'react';

const OrderHeader = ({ tableNumber, orderType, paymentMethod }) => {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-md font-bold text-gray-800">Customer <span className=" text-sm text-gray-500"
        >{tableNumber}</span></h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold text-sm">
            {orderType}
          </button>
        </div>
      </div>
      {paymentMethod && (
        <div className="text-sm text-gray-600">
          Payment Method: <span className="font-medium capitalize">{paymentMethod}</span>
        </div>
      )}
    </div>
  );
};

export default OrderHeader;