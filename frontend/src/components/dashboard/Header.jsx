"use client";

import { useSelector } from "react-redux";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const { isRunning } = useSelector((state) => state.bot);

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              نظام إدارة الرسائل
            </h1>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div
                className={`w-3 h-3 rounded-full mr-2 animate-pulse ${
                  isRunning ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <span className="text-sm text-white">
                {isRunning ? "الروبوت نشط" : "الروبوت متوقف"}
              </span>
            </div>

            <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">
                  {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <span className="mr-2 text-sm font-medium text-white">
                {currentUser?.username || "مستخدم"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
