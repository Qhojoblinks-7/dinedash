import React from 'react';

const statusStyles = {
  'process': 'bg-yellow-100 text-yellow-700',
  'kitchen': 'bg-blue-100 text-blue-700',
  'serving': 'bg-green-100 text-green-700',
};

const TableStatusPill = ({ tableNumber, status, customerName, onClick }) => {
  const pillClasses = statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-700';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-xs ${pillClasses} cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={onClick}
    >
      <span>{tableNumber}</span>
      {customerName && <span className="hidden sm:inline">{customerName}</span>}
      <span className="hidden md:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
};

export default TableStatusPill;