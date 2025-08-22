'use client';

import { useSelector } from 'react-redux';

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { isRunning } = useSelector((state) => state.bot);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isRunning ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600">
                {isRunning ? 'الروبوت نشط' : 'الروبوت متوقف'}
              </span>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {currentUser?.username}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;