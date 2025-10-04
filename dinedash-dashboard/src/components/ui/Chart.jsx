import React from 'react';

const BarChart = ({ data, className = '' }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className={`flex items-end space-x-2 h-80 ${className}`}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className="bg-primary w-full rounded-t hover:opacity-80 transition-opacity"
            style={{ height: `${(item.value / maxValue) * 250}px` }}
          ></div>
          <p className="text-xs mt-2 font-medium">{item.label}</p>
          <p className="text-xs text-muted-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export { BarChart };