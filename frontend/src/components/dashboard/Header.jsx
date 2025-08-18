import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  FaBell,
  FaCog,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { signoutSuccess } from "../../redux/user/userSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // جلب الإشعارات
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/notifications`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // تحديث كل 30 ثانية
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to logout");

      dispatch(signoutSuccess());
      navigate.push("/login");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg py-4 px-4 md:px-6 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center">
        <button
          className="md:hidden mr-3 text-xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-10 h-10 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <h1 className="text-xl font-bold mr-3 hidden md:block">روبوت حراج وعقار</h1>
      </div>

      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <button className="relative p-2 text-white hover:text-gray-200">
          <FaBell className="text-xl" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs transform translate-x-1 -translate-y-1">
              {unreadCount}
            </span>
          )}
        </button>

        <button className="p-2 text-white hover:text-gray-200 hidden md:block">
          <FaCog className="text-xl" />
        </button>

        <div className="relative group hidden md:block">
          <button className="flex items-center space-x-2 hover:bg-blue-600 px-2 py-1 rounded-lg transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center shadow-sm">
              <span className="text-white font-medium">م</span>
            </div>
            <span className="text-sm font-medium">المستخدم</span>
          </button>

          <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaSignOutAlt className="mr-2 text-red-500" />
              {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
