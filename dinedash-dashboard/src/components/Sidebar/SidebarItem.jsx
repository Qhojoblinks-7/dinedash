import React from 'react';

const SidebarItem = ({ icon, label, isActive, ...props }) => {
  return (
    <div
      className={`
        flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors duration-200
        ${isActive ? 'bg-green-100 text-green-700 font-semibold' : 'hover:bg-gray-200 text-gray-600'}
      `}
      {...props}
    >
      <div className={`p-2 rounded-full ${isActive ? 'bg-green-600/10' : ''}`}>
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default SidebarItem;