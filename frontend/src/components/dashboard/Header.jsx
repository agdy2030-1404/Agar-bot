// app/dashboard/Header.jsx
import React, { useState } from "react";
import {
  FaBell,
  FaCog,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3);

  return (
    <header className="bg-gradient-to-r from-primary-700 to-primary-800 text-white shadow-lg py-4 px-4 md:px-6 flex justify-between items-center">
      <div className="flex items-center">
        <button
          className="md:hidden mr-3 text-xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="bg-gradient-to-r from-secondary-500 to-primary-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <h1 className="text-xl font-bold mr-3 hidden md:block">
          روبوت حراج وعقار
        </h1>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white text-gray-800 shadow-lg rounded-b-lg py-4 md:hidden z-50">
          <div className="flex flex-col space-y-4 px-4">
            <button className="flex items-center p-2 rounded-lg hover:bg-gray-100">
              <FaBell className="text-xl mr-2" />
              <span>الإشعارات</span>
              {notificationsCount > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {notificationsCount}
                </span>
              )}
            </button>
            <button className="flex items-center p-2 rounded-lg hover:bg-gray-100">
              <FaCog className="text-xl mr-2" />
              <span>الإعدادات</span>
            </button>
            <button className="flex items-center p-2 rounded-lg hover:bg-gray-100">
              <FaUserCircle className="text-xl mr-2" />
              <span>حسابي</span>
            </button>
            <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-red-500">
              <FaSignOutAlt className="text-xl mr-2" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-white hover:text-gray-200">
          <FaBell className="text-xl" />
          {notificationsCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
              {notificationsCount}
            </span>
          )}
        </button>

        <button className="p-2 text-white hover:text-gray-200 hidden md:block">
          <FaCog className="text-xl" />
        </button>

        <div className="relative group hidden md:block">
          <button className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-secondary-400 to-primary-400 flex items-center justify-center">
              <span className="text-white font-medium">م</span>
            </div>
            <span className="text-sm font-medium">المستخدم</span>
          </button>

          <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaUserCircle className="mr-2" /> حسابي
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaSignOutAlt className="mr-2 text-red-500" /> تسجيل الخروج
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
