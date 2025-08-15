// app/dashboard/BotStatus.jsx
import React from 'react';
import { FaPowerOff, FaSyncAlt, FaPause, FaPlay, FaClock } from 'react-icons/fa';

const BotStatus = ({ isRunning, setIsRunning, updateInterval, setUpdateInterval }) => {
  const status = isRunning ? 'running' : 'paused';
  
  const statusColors = {
    running: 'bg-green-100 text-green-800',
    paused: 'bg-amber-100 text-amber-800',
    stopped: 'bg-red-100 text-red-800',
  };
  
  const statusIcons = {
    running: <FaSyncAlt className="animate-spin" />,
    paused: <FaPause />,
    stopped: <FaPowerOff />,
  };
  
  const statusTexts = {
    running: 'يعمل',
    paused: 'معلق',
    stopped: 'متوقف',
  };

  const getIntervalColor = () => {
    if (updateInterval <= 24) return 'text-green-600';
    if (updateInterval <= 36) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="card bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">حالة الروبوت</h2>
      </div>
      
      <div className="p-5 flex-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${statusColors[status]}`}></div>
            <span className="font-medium text-gray-800">{statusTexts[status]}</span>
            <div className="ml-3 p-3 rounded-xl bg-gray-100 text-gray-600">
              {statusIcons[status]}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`py-2 px-4 rounded-lg font-medium flex items-center ${
                isRunning 
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              {isRunning ? (
                <>
                  <FaPause className="ml-2" /> إيقاف مؤقت
                </>
              ) : (
                <>
                  <FaPlay className="ml-2" /> استئناف
                </>
              )}
            </button>
            
            <button 
              onClick={() => setIsRunning(false)}
              className="py-2 px-4 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg font-medium flex items-center"
            >
              <FaPowerOff className="ml-2" /> إيقاف
            </button>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center mb-4">
            <FaClock className="text-primary-600 mr-2" />
            <h3 className="font-medium text-gray-800">فترة تحديث الإعلانات</h3>
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <input 
                type="range" 
                min="20" 
                max="48" 
                value={updateInterval} 
                onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <span className={`py-1.5 px-4 rounded-lg font-medium min-w-[70px] text-center bg-gradient-to-b from-gray-50 to-white border border-gray-200 shadow-sm ${getIntervalColor()}`}>
                {updateInterval} ساعة
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>20 ساعة</span>
              <span>34 ساعة</span>
              <span>48 ساعة</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4 bg-gray-50 p-3 rounded-lg">
            سيتم تحديث الإعلانات بشكل عشوائي بين {updateInterval - 4} إلى {parseInt(updateInterval) + 4} ساعة لتجنب الكشف
          </p>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          {isRunning 
            ? "الروبوت يعمل حالياً، سيتم التحديث التلقائي في الوقت المحدد" 
            : "الروبوت متوقف حالياً، سيبدأ العمل عند الضغط على استئناف"}
        </p>
      </div>
    </div>
  );
};

export default BotStatus;