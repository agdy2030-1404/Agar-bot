// app/dashboard/page.jsx
"use client";

import React, { useState } from "react";
import Header from "./Header";
import StatCard from "./StatCard";
import BotStatus from "./BotStatus";
import AdsTable from "./AdsTable";
import ActivityLog from "./ActivityLog";
import MessageTemplates from "./MessageTemplates";

const Dashboard = () => {
  const [isBotRunning, setIsBotRunning] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(24);
  
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
            value="12" 
            icon="📋" 
            color="primary" 
            trend="+2 منذ أمس" 
          />
          <StatCard 
            title="الإعلانات المحدثة" 
            value="8" 
            icon="🔄" 
            color="secondary" 
            trend="مخطط للتحديث" 
          />
          <StatCard 
            title="الرسائل المجابة" 
            value="24" 
            icon="💬" 
            color="green" 
            trend="+5 منذ ساعة" 
          />
          <StatCard 
            title="الأخطاء" 
            value="3" 
            icon="⚠️" 
            color="amber" 
            trend="-1 منذ أمس" 
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
        <p>© {new Date().getFullYear()} روبوت حراج وعقار. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
};

export default Dashboard;