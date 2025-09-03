"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AutoReplyManager() {
  const unifiedReply =
    "السلام عليكم ورحمة الله يعطيكم العافية لاهنتوا رقم الوسيط في الإعلان أرجو التواصل معاه ولكم جزيل الشكر والتقدير-إدارة منصة صانع العقود للخدمات العقارية";

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-6 text-white">
            <h2 className="text-2xl font-bold">الرد التلقائي الموحد</h2>
            <p className="text-cyan-200 mt-1">
              الرد التلقائي الموحد لجميع رسائل العملاء
            </p>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                الرد الحالي
              </h3>
              <p className="text-blue-700 leading-relaxed">{unifiedReply}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">معلومات:</h4>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• سيتم إرسال هذا الرد لجميع العملاء</li>
                <li>• لا حاجة لإدارة قوالب متعددة</li>
                <li>• النظام يعمل تلقائياً عند تشغيل الرد التلقائي</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
