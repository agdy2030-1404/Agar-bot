'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBotStatus, startBot, stopBot } from '@/redux/bot/botSlice';

const BotStatus = () => {
  const dispatch = useDispatch();
  const { isRunning, isLoggedIn, loading, error } = useSelector((state) => state.bot);

  useEffect(() => {
    dispatch(getBotStatus());
    const interval = setInterval(() => {
      dispatch(getBotStatus());
    }, 30000); // تحديث كل 30 ثانية

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleToggle = () => {
    if (isRunning) {
      dispatch(stopBot());
    } else {
      dispatch(startBot());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">حالة الروبوت</h2>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            isRunning ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm font-medium">
            {isRunning ? 'متصل' : 'غير متصل'}
          </span>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isRunning 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          } disabled:opacity-50`}
        >
          {loading ? 'جاري المعالجة...' : isRunning ? 'إيقاف' : 'تشغيل'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">حالة التسجيل:</span>
          <span className={`ml-2 font-medium ${
            isLoggedIn ? 'text-green-600' : 'text-red-600'
          }`}>
            {isLoggedIn ? 'مسجل الدخول' : 'غير مسجل'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-600">آخر تحديث:</span>
          <span className="ml-2 font-medium">
            {new Date().toLocaleString('ar-SA')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BotStatus;