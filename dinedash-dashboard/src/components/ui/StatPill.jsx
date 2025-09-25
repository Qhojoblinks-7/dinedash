import React from 'react';

const colorStyles = {
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
};

const StatPill = ({ value, color = 'green', icon }) => {
  const pillClasses = colorStyles[color] || 'bg-gray-500 text-white';

  return (
    <div className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm ${pillClasses}`}>
      {icon ? (
        <span className="flex items-center justify-center h-full w-full">{icon}</span>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
};

export default StatPill;