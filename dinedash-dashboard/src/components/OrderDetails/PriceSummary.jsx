import React from 'react';

const PriceSummary = ({ subTotal, tax, totalAmount }) => {
  return (
    <div className="p-4 space-y-2 text-sm text-gray-600 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between">
        <span>Sub Total</span>
        <span>₵{subTotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax 5%</span>
        <span>₵{tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-base font-bold text-gray-800 border-t pt-2 mt-2 border-gray-200">
        <span>Total Amount</span>
        <span>₵{totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PriceSummary;