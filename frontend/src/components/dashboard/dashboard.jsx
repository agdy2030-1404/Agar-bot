"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Header from "./Header";
import StatCard from "./StatCard";
import BotStatus from "./BotStatus";
import AdsTable from "./AdsTable";
import ActivityLog from "./ActivityLog";
import MessageTemplates from "./MessageTemplates";
import { getDashboardData } from "../../services/dashboard.service";

const Dashboard = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(24);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const data = await getDashboardData();
          setDashboardData(data?.data || {}); // استخدم data?.data
          setIsBotRunning(data?.data?.botStatus?.isRunning || false);
          setUpdateInterval(data?.data?.botStatus?.updateInterval || 24);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            لوحة تحكم روبوت حراج وعقار
          </h1>
          <p className="text-gray-600 mt-1">
            مراقبة وإدارة روبوت تحديث إعلاناتك على حراج وعقار
          </p>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="عدد الإعلانات"
            icon="📋"
            color="primary"
            value={dashboardData?.stats?.totalAds || 0}
            trend={`${dashboardData?.stats?.adViewsTrend >= 0 ? "+" : ""}${
              dashboardData?.stats?.adViewsTrend || 0
            }% عن الأسبوع الماضي`}
          />
          <StatCard
            title="الإعلانات المحدثة"
            value={dashboardData?.stats.activeAds || "0"}
            icon="🔄"
            color="secondary"
            trend={`من ${dashboardData?.stats.totalAds || 0} إعلان`}
          />
          <StatCard
            title="الرسائل المجابة"
            value={dashboardData?.stats.repliedMessages || "0"}
            icon="💬"
            color="green"
            trend={`${dashboardData?.stats.messageTrend >= 0 ? "+" : ""}${
              dashboardData?.stats.messageTrend || 0
            }% عن الأسبوع الماضي`}
          />
          <StatCard
            title="الأخطاء"
            value={dashboardData?.stats.errors || "0"}
            icon="⚠️"
            color="amber"
            trend="آخر 24 ساعة"
          />
        </div>

        {/* حالة الروبوت وجدول الإعلانات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <BotStatus
              isRunning={isBotRunning}
              setIsRunning={setIsBotRunning}
              updateInterval={updateInterval}
              setUpdateInterval={setUpdateInterval}
            />
          </div>
          <div className="lg:col-span-2">
            <AdsTable />
          </div>
        </div>

        {/* سجل الأنشطة وقوالب الردود */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ActivityLog />
          </div>
          <div className="lg:col-span-2">
            <MessageTemplates />
          </div>
        </div>
      </main>

      <footer className="mt-8 py-4 px-6 border-t border-gray-200 text-center text-gray-500 bg-white">
        <p>
          © {new Date().getFullYear()} روبوت حراج وعقار. جميع الحقوق محفوظة.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
