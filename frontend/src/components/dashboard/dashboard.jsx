'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Header from '@/components/dashboard/Header';
import BotStatus from '@/components/dashboard/BotStatus';
import AutoReplyManager from '@/components/dashboard/AutoReplyManager';
import ActivityLog from '@/components/dashboard/ActivityLog';
import { getBotStatus } from '@/redux/bot/botSlice';
import { fetchMessages } from '@/redux/messages/messageSlice';

export default function DashboardPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getBotStatus());
    dispatch(fetchMessages());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* العمود الأول */}
          <div className="space-y-8">
            <BotStatus />
            <ActivityLog />
          </div>
          
          {/* العمود الثاني */}
          <div className="space-y-8">
            <AutoReplyManager />
            {/* يمكنك إضافة مكونات إضافية هنا */}
          </div>
        </div>
      </main>
    </div>
  );
}