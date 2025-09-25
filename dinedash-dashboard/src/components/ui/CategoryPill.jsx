import React from 'react';

const CategoryPill = ({ icon, name, count, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-200 whitespace-nowrap
        ${isActive ? 'bg-green-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-200'}
      `}
    >
      <div className="w-5 h-5">{icon}</div>
      <span>{name}</span>
      <span className={`text-xs font-normal ${isActive ? 'bg-white/30 px-2 py-0.5 rounded-full' : 'text-gray-500'}`}>
        {count}
      </span>
    </button>
  );
};

export default CategoryPill;