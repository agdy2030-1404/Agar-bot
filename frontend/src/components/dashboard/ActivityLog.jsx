// app/dashboard/ActivityLog.jsx
"use client";
import { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaSyncAlt,
  FaCommentAlt,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { getRecentActivities } from "../../services/activity.service";

const ActivityLog = ({ token }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { activities } = await getRecentActivities(token);
        setActivities(activities);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [token]);

  const getTypeColor = (type) => {
    switch (type) {
      case "renew":
        return "bg-blue-100 border-blue-200";
      case "message":
      case "login":
      case "bot_start":
        return "bg-green-100 border-green-200";
      case "error":
      case "bot_stop":
        return "bg-red-100 border-red-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "renew":
        return <FaSyncAlt className="text-blue-500" />;
      case "message":
        return <FaCommentAlt className="text-green-500" />;
      case "error":
        return <FaExclamationTriangle className="text-red-500" />;
      case "login":
        return <FaCheckCircle className="text-green-500" />;
      case "bot_start":
      case "bot_stop":
        return <FaInfoCircle className="text-primary-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMinutes = Math.floor((now - date) / (1000 * 60));
      return `منذ ${diffMinutes} دقيقة`;
    } else if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `منذ ${diffDays} يوم`;
    }
  };

  if (loading) return <div className="p-4">جاري تحميل سجل الأنشطة...</div>;

  return (
    <div className="card bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">سجل الأنشطة</h2>
        <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
          عرض الكل
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="relative pl-8 border-l-2 border-gray-200 ml-4">
          {activities.map((activity) => (
            <div key={activity._id} className="relative mb-6">
              <div className="absolute -left-9 top-0 w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                {getTypeIcon(activity.type)}
              </div>
              <div
                className={`ml-2 p-4 rounded-xl border ${getTypeColor(
                  activity.type
                )}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">
                    {activity.title}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(activity.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
