// app/dashboard/ActivityLog.jsx
import React from 'react';
import { FaCheckCircle, FaSyncAlt, FaCommentAlt, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const ActivityLog = () => {
  // بيانات وهمية لسجل الأنشطة
  const activities = [
    { id: 1, type: 'renew', title: 'تم تحديث الإعلان', description: 'شقة فاخرة للبيع في حي السفارات', time: 'منذ 2 دقيقة', icon: <FaSyncAlt className="text-blue-500" /> },
    { id: 2, type: 'message', title: 'تم الرد على رسالة', description: 'من محمد أحمد بخصوص الفيلا', time: 'منذ 15 دقيقة', icon: <FaCommentAlt className="text-green-500" /> },
    { id: 3, type: 'renew', title: 'تم تحديث الإعلان', description: 'أرض سكنية في مخطط راقي', time: 'منذ 1 ساعة', icon: <FaSyncAlt className="text-blue-500" /> },
    { id: 4, type: 'error', title: 'فشل في تحديث الإعلان', description: 'مكتب تجاري في مركز المدينة', time: 'منذ 3 ساعات', icon: <FaExclamationTriangle className="text-red-500" /> },
    { id: 5, type: 'login', title: 'تم تسجيل الدخول', description: 'بواسطة المستخدم', time: 'منذ 5 ساعات', icon: <FaCheckCircle className="text-green-500" /> },
    { id: 6, type: 'info', title: 'بدأ الروبوت العمل', description: 'تم تشغيل الروبوت بنجاح', time: 'منذ 7 ساعات', icon: <FaInfoCircle className="text-primary-500" /> },
  ];

  const getTypeColor = (type) => {
    switch(type) {
      case 'renew': return 'bg-blue-100 border-blue-200';
      case 'message': return 'bg-green-100 border-green-200';
      case 'error': return 'bg-red-100 border-red-200';
      case 'login': return 'bg-green-100 border-green-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

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
            <div key={activity.id} className="relative mb-6">
              <div className="absolute -left-9 top-0 w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full ${getTypeColor(activity.type).replace('bg-', 'bg-').replace('border-', 'border-')}`}></div>
              </div>
              
              <div className={`ml-2 p-4 rounded-xl border ${getTypeColor(activity.type)}`}>
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">{activity.title}</h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;