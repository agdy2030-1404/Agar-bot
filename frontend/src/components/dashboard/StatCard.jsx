// app/dashboard/StatCard.jsx
"use client";
import { useState, useEffect } from "react";
import { getStats } from "../../services/stats.service";

const StatCard = ({ title, metric, icon, color, token }) => {
  const [value, setValue] = useState("--");
  const [trend, setTrend] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { stats } = await getStats(token);

        // Set values based on metric
        switch (metric) {
          case "totalAds":
            setValue(stats.ads.total);
            setTrend(
              stats.trends.adViews >= 0
                ? `↑ ${stats.trends.adViews}% عن الأسبوع الماضي`
                : `↓ ${Math.abs(stats.trends.adViews)}% عن الأسبوع الماضي`
            );
            setLastUpdated(stats.ads.lastUpdated);
            break;
          case "activeAds":
            setValue(stats.ads.active);
            setTrend(`من ${stats.ads.total} إعلان`);
            setLastUpdated(stats.ads.lastUpdated);
            break;
          case "repliedMessages":
            setValue(stats.messages.replied);
            setTrend(
              stats.trends.messageResponse >= 0
                ? `↑ ${stats.trends.messageResponse}% عن الأسبوع الماضي`
                : `↓ ${Math.abs(
                    stats.trends.messageResponse
                  )}% عن الأسبوع الماضي`
            );
            setLastUpdated(stats.messages.lastUpdated);
            break;
          case "botUptime":
            setValue(stats.bot.uptime);
            setTrend(`معدل نجاح ${stats.bot.successRate}%`);
            setLastUpdated(stats.bot.lastActivity);
            break;
          default:
            setValue("--");
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, metric]);

  const bgColors = {
    primary: "bg-gradient-to-br from-primary-100 to-primary-50",
    secondary: "bg-gradient-to-br from-secondary-100 to-secondary-50",
    green: "bg-gradient-to-br from-green-100 to-green-50",
    amber: "bg-gradient-to-br from-amber-100 to-amber-50",
  };

  const textColors = {
    primary: "text-primary-700",
    secondary: "text-secondary-700",
    green: "text-green-700",
    amber: "text-amber-700",
  };

  const iconBgColors = {
    primary: "bg-primary-100",
    secondary: "bg-secondary-100",
    green: "bg-green-100",
    amber: "bg-amber-100",
  };

  const formatTime = (dateString) => {
    if (!dateString) return "غير معروف";

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

  if (loading) {
    return (
      <div
        className={`${bgColors[color]} rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse`}
      >
        <div className="p-5 h-24"></div>
      </div>
    );
  }

  return (
    <div
      className={`${bgColors[color]} rounded-xl shadow-sm border border-gray-100 overflow-hidden`}
    >
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
        <p className="text-xs text-gray-500">
          آخر تحديث: {formatTime(lastUpdated)}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
