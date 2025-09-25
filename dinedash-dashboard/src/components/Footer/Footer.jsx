import React from 'react';
import TableStatusPill from './TableStatusPill';

const Footer = ({ activeTables, onPlaceOrder }) => {
  return (
    <div className="fixed bottom-0 left-64 right-0 bg-white p-4 flex justify-between items-center shadow-2xl z-10">
      {/* Table Status Pills */}
      <div className="flex gap-4 overflow-x-auto">
        {activeTables.map((table) => (
          <TableStatusPill
            key={table.id}
            tableNumber={table.tableNumber}
            status={table.status}
          />
        ))}
      </div>

      {/* Place Order Button */}
      <button
        onClick={onPlaceOrder}
        className="bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-200 flex-shrink-0"
      >
        Place Order
      </button>
    </div>
  );
};

export default Footer;