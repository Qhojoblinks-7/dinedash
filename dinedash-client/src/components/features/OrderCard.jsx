import React from 'react';
import { FaArrowRight } from 'react-icons/fa'; // We'll use react-icons for the arrow.

// You'll need to install react-icons if you haven't already:
// npm install react-icons

const OrderCard = ({ orderId, customerName, totalItems, status }) => {
  // A helper function to determine the color of the status tag based on the status value.
  const getStatusColor = (status) => {
    switch (status) {
      case 'Process':
        return 'bg-green-100 text-green-600';
      case 'Completed':
        return 'bg-blue-100 text-blue-600';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-600';
    }
  };

  return (
    <div className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Order ID circle */}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 text-white font-bold text-sm">
        {orderId}
      </div>

      {/* Order details */}
      <div className="ml-4 flex-grow">
        <div className="flex items-center">
          <span className="font-semibold text-gray-800">{customerName}</span>
          <span
            className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-500 flex items-center">
          <span>{totalItems} items</span>
          <FaArrowRight className="mx-2" />
          <span>Kitchen</span>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;