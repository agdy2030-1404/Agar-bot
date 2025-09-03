"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import adService from "@/services/ad.service";
import messageService from "@/services/message.service";

export default function AdsTable() {
  const {
    ads,
    loading: adsLoading,
    error: adsError,
  } = useSelector((state) => state.bot);

  const [loadingAd, setLoadingAd] = useState(null);
  const [processingMessages, setProcessingMessages] = useState(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (ads && ads.length > 0) {
      setHasData(true);
    }
  }, [ads]);

  const handleUpdateAd = async (adId, e) => {
    e.stopPropagation();
    try {
      setLoadingAd(adId);
      await adService.updateAd(adId);
      toast.success("تم تحديث الإعلان بنجاح", {
        position: "top-left",
        rtl: true,
      });
    } catch (error) {
      toast.error("فشل في تحديث الإعلان", {
        position: "top-left",
        rtl: true,
      });
    } finally {
      setLoadingAd(null);
    }
  };

  const handleAutoReply = async (adId, e) => {
    e.stopPropagation();
    try {
      setProcessingMessages(adId);
      await messageService.processMessages(adId);
      toast.success("تم تشغيل الرد التلقائي بنجاح", {
        position: "top-left",
        rtl: true,
      });
    } catch (error) {
      toast.error("فشل في تشغيل الرد التلقائي", {
        position: "top-left",
        rtl: true,
      });
    } finally {
      setProcessingMessages(null);
    }
  };

  if (adsLoading && !hasData) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-7 bg-gray-200 rounded-lg w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (adsError && !hasData) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {adsError}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        إعلاناتي
      </h2>

      {ads.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg">لا توجد إعلانات حالياً</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-right font-medium text-gray-600 uppercase tracking-wider"
                >
                  الإعلان
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right font-medium text-gray-600 uppercase tracking-wider"
                >
                  السعر
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right font-medium text-gray-600 uppercase tracking-wider"
                >
                  المساحة
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right font-medium text-gray-600 uppercase tracking-wider"
                >
                  الغرف
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right font-medium text-gray-600 uppercase tracking-wider"
                >
                  الحالة
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right font-medium text-gray-600 uppercase tracking-wider"
                >
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ads.map((ad) => (
                <tr
                  key={ad.adId || ad._id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {ad.imageUrl && (
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-14 h-14 object-cover rounded-xl mr-4 shadow-sm"
                        />
                      )}
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {ad.title}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {ad.adId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold text-gray-900">
                    {ad.price ? `${ad.price} ر.س` : "غير محدد"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {ad.area ? `${ad.area} م²` : "غير محدد"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {ad.rooms || "غير محدد"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        ad.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ad.status === "active" ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={(e) => handleUpdateAd(ad.adId, e)}
                        disabled={
                          loadingAd === ad.adId || ad.status !== "active"
                        }
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center ${
                          loadingAd === ad.adId || ad.status !== "active"
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transform hover:scale-105"
                        }`}
                      >
                        {loadingAd === ad.adId ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            جاري التحديث
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            تحديث
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => handleAutoReply(ad.adId, e)}
                        disabled={
                          processingMessages === ad.adId ||
                          ad.status !== "active"
                        }
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center ${
                          processingMessages === ad.adId ||
                          ad.status !== "active"
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 transform hover:scale-105"
                        }`}
                      >
                        {processingMessages === ad.adId ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            جاري الرد
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 ml-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                              />
                            </svg>
                            رد تلقائي
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
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
