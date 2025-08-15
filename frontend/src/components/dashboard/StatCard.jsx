// app/dashboard/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, color, trend }) => {
  const bgColors = {
    primary: 'bg-gradient-to-br from-primary-100 to-primary-50',
    secondary: 'bg-gradient-to-br from-secondary-100 to-secondary-50',
    green: 'bg-gradient-to-br from-green-100 to-green-50',
    amber: 'bg-gradient-to-br from-amber-100 to-amber-50',
  };
  
  const textColors = {
    primary: 'text-primary-700',
    secondary: 'text-secondary-700',
    green: 'text-green-700',
    amber: 'text-amber-700',
  };
  
  const iconBgColors = {
    primary: 'bg-primary-100',
    secondary: 'bg-secondary-100',
    green: 'bg-green-100',
    amber: 'bg-amber-100',
  };
  
  return (
    <div className={`${bgColors[color]} rounded-xl shadow-sm border border-gray-100 overflow-hidden`}>
      <div className="p-5 flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
          <p className="text-xs mt-1 text-gray-500">{trend}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBgColors[color]}`}>
          <span className={`text-2xl ${textColors[color]}`}>{icon}</span>
        </div>
      </div>
      <div className="px-5 py-3 bg-white bg-opacity-70 border-t border-gray-100">
        <p className="text-xs text-gray-500">آخر تحديث: منذ ساعتين</p>
      </div>
    </div>
  );
};

export default StatCard;