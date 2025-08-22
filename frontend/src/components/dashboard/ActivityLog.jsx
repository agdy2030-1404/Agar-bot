'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const { messages } = useSelector((state) => state.messages);

  useEffect(() => {
    // دمج النشاطات من مصادر مختلفة
    const mergedActivities = [
      ...messages.map(msg => ({
        type: 'message',
        title: 'رسالة جديدة',
        description: `رسالة من ${msg.senderName}`,
        time: msg.receivedAt,
        status: msg.status
      })),
      // يمكنك إضافة نشاطات أخرى من الإعلانات هنا
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    setActivities(mergedActivities.slice(0, 10)); // آخر 10 نشاطات
  }, [messages]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'replied': return 'تم الرد';
      case 'read': return 'مقروء';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">سجل النشاطات</h2>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
            <div className="flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${
                activity.type === 'message' ? 'bg-blue-500' : 'bg-green-500'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(activity.time).toLocaleString('ar-SA')}
              </p>
            </div>
            
            {activity.status && (
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                {getStatusText(activity.status)}
              </span>
            )}
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد نشاطات مسجلة
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;