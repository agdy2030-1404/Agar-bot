"use client";
import { useState, useEffect } from "react";
import { FaSync, FaEye, FaEdit, FaEllipsisH } from "react-icons/fa";
import {
  getAds,
  renewAd,
  renewAllAds,
  syncAds,
} from "../../services/ad.service";

const AdsTable = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [renewAllLoading, setRenewAllLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAds, setTotalAds] = useState(0);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  const statusColors = {
    active: "bg-green-100 text-green-800",
    expired: "bg-gray-100 text-gray-800",
    pending: "bg-amber-100 text-amber-800",
    rejected: "bg-red-100 text-red-800",
  };

  const statusTexts = {
    active: "نشط",
    expired: "منتهي",
    pending: "معلق",
    rejected: "مرفوض",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    return diffHours < 24
      ? `منذ ${diffHours} ساعة`
      : `منذ ${Math.floor(diffHours / 24)} يوم`;
  };

  const fetchAdsData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const { ads, pagination } = await getAds({
        page,
        limit: itemsPerPage,
      });

      if (!ads || !Array.isArray(ads)) {
        throw new Error("تلقينا بيانات غير صالحة من الخادم");
      }

      setAds(ads);
      setTotalPages(pagination?.totalPages || 1);
      setTotalAds(pagination?.totalAds || 0);
    } catch (err) {
      console.error("Failed to fetch ads:", err);
      setError(err.message || "حدث خطأ أثناء جلب الإعلانات");
      setAds([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAdsData(currentPage);
  }, [currentPage]);

  const handleRenewAd = async (id) => {
    try {
      setAds((prev) =>
        prev.map((a) => (a._id === id ? { ...a, loading: true } : a))
      );
      const { ad } = await renewAd(id);
      setAds((prev) => prev.map((a) => (a._id === id ? ad : a)));
    } catch (err) {
      console.error("Failed to renew ad:", err);
      setError(err.message || "حدث خطأ أثناء تجديد الإعلان");
    }
  };

  const handleRenewAll = async () => {
    try {
      setRenewAllLoading(true);
      setError(null);
      const { renewedCount } = await renewAllAds();
      if (renewedCount > 0) {
        fetchAdsData(currentPage);
      }
    } catch (err) {
      console.error("Failed to renew all ads:", err);
      setError(err.message || "حدث خطأ أثناء تجديد جميع الإعلانات");
    } finally {
      setRenewAllLoading(false);
    }
  };

  const handleSyncAds = async (platform) => {
    try {
      setSyncLoading(true);
      setError(null);
      const { message } = await syncAds(platform);
      toast.success(message);
      await fetchAdsData(1);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to sync ads:", err);
      setError(err.message || "فشلت عملية المزامنة");
      toast.error(err.message || "فشلت عملية المزامنة");
    } finally {
      setSyncLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-3 md:mb-0">
          إعلاناتي
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSyncAds("haraj")}
            disabled={syncLoading}
            className="btn-outline flex items-center"
          >
            {syncLoading ? (
              <span className="animate-spin mr-2">↻</span>
            ) : (
              <FaSync className="ml-2" />
            )}
            مزامنة Haraj
          </button>
          <button
            onClick={() => handleSyncAds("aqar")}
            disabled={syncLoading}
            className="btn-outline flex items-center"
          >
            {syncLoading ? (
              <span className="animate-spin mr-2">↻</span>
            ) : (
              <FaSync className="ml-2" />
            )}
            مزامنة Aqar
          </button>
          <button
            onClick={handleRenewAll}
            disabled={renewAllLoading}
            className="btn-primary flex items-center"
          >
            {renewAllLoading ? (
              <span className="animate-spin mr-2">↻</span>
            ) : (
              <FaSync className="ml-2" />
            )}
            تحديث جميع الإعلانات
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإعلان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المشاهدات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                آخر تحديث
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ads.map((ad) => (
              <tr key={ad._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 max-w-xs truncate" title={ad.title}>
                  {ad.title}
                </td>
                <td className="px-6 py-4">{ad.views.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      statusColors[ad.status]
                    }`}
                  >
                    {statusTexts[ad.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(ad.lastRenewed)}
                </td>
                <td className="px-6 py-4 space-x-2 flex justify-end">
                  <button
                    onClick={() => handleRenewAd(ad._id)}
                    disabled={ad.loading}
                    className="p-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    title="تجديد الإعلان"
                  >
                    {ad.loading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaSync />
                    )}
                  </button>
                  <a
                    href={ad.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-gray-800"
                    title="معاينة الإعلان"
                  >
                    <FaEye />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between sm:px-6">
          <p className="text-sm text-gray-700">
            عرض{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            إلى{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalAds)}
            </span>{" "}
            من <span className="font-medium">{totalAds}</span> نتائج
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50"
            >
              السابق
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsTable;
