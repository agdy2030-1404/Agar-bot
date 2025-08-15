// app/dashboard/AdsTable.jsx
import React, { useState } from 'react';
import { FaSync, FaEye, FaEdit, FaTrash, FaChevronRight, FaChevronLeft, FaEllipsisH } from 'react-icons/fa';

const AdsTable = () => {
  // بيانات وهمية للإعلانات
  const [ads, setAds] = useState([
    { id: 1, title: 'شقة فاخرة للبيع في حي السفارات', views: 124, status: 'نشط', lastRenewed: 'منذ 12 ساعة' },
    { id: 2, title: 'فيلا جديدة في شمال الرياض', views: 89, status: 'نشط', lastRenewed: 'منذ 22 ساعة' },
    { id: 3, title: 'أرض سكنية في مخطط راقي', views: 56, status: 'منتهي', lastRenewed: 'منذ 3 أيام' },
    { id: 4, title: 'شقة مفروشة للإيجار اليومي', views: 210, status: 'نشط', lastRenewed: 'منذ 18 ساعة' },
    { id: 5, title: 'مكتب تجاري في مركز المدينة', views: 42, status: 'معلق', lastRenewed: 'منذ 5 أيام' },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(ads.length / itemsPerPage);

  const statusColors = {
    نشط: 'bg-green-100 text-green-800',
    منتهي: 'bg-gray-100 text-gray-800',
    معلق: 'bg-amber-100 text-amber-800',
  };

  const renewAd = (id) => {
    setAds(ads.map(ad => 
      ad.id === id ? {...ad, lastRenewed: 'الآن', status: 'نشط'} : ad
    ));
  };

  const renewAll = () => {
    setAds(ads.map(ad => 
      ad.status !== 'منتهي' ? {...ad, lastRenewed: 'الآن', status: 'نشط'} : ad
    ));
  };

  return (
    <div className="card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-3 md:mb-0">إعلاناتي</h2>
        <button 
          onClick={renewAll}
          className="btn-primary flex items-center"
        >
          <FaSync className="ml-2" /> تحديث جميع الإعلانات
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإعلان
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المشاهدات
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                آخر تحديث
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((ad) => (
              <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">{ad.views}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ad.status]}`}>
                    {ad.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {ad.lastRenewed}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <button 
                      onClick={() => renewAd(ad.id)}
                      className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-100"
                      title="تحديث الإعلان"
                    >
                      <FaSync />
                    </button>
                    <button 
                      className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                      title="معاينة الإعلان"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                      title="تعديل الإعلان"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                      title="المزيد"
                    >
                      <FaEllipsisH />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            السابق
          </button>
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            التالي
          </button>
        </div>
        
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              عرض <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> إلى{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, ads.length)}</span> من{' '}
              <span className="font-medium">{ads.length}</span> نتائج
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">السابق</span>
                <FaChevronRight className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                  currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">التالي</span>
                <FaChevronLeft className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsTable;