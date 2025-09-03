"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  processMessages,
  fetchUserAds,
} from "@/redux/messages/messageSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Messages() {
  const dispatch = useDispatch();
  const { messages, loading, processing, error, userAds } = useSelector(
    (state) => state.messages
  );
  const [selectedAdId, setSelectedAdId] = useState("all");

  useEffect(() => {
    dispatch(fetchMessages({ status: "", page: 1, limit: 20 }));
    dispatch(fetchUserAds());
  }, [dispatch]);

  const handleProcess = () => {
    const adId = selectedAdId === "all" ? null : selectedAdId;
    dispatch(processMessages(adId))
      .then(() => {
        dispatch(fetchMessages({ status: "", page: 1, limit: 20 }));
        toast.success("تم معالجة الرسائل بنجاح!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          rtl: true,
        });
      })
      .catch((error) => {
        toast.error("فشل في معالجة الرسائل", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          rtl: true,
        });
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
            <h2 className="text-2xl font-bold">إدارة الرسائل</h2>
            <p className="text-purple-200 mt-1">
              عرض وإدارة جميع رسائل العملاء
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800">
                  الرسائل الواردة
                </h3>
                <p className="text-gray-500 text-sm">
                  إجمالي الرسائل: {messages.length}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <select
                  value={selectedAdId}
                  onChange={(e) => setSelectedAdId(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm w-full"
                >
                  <option value="all">جميع الإعلانات</option>
                  {userAds.map((ad) => (
                    <option key={ad.adId} value={ad.adId}>
                      {ad.title} - {ad.adId}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {processing ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      تشغيل الرد التلقائي
                    </>
                  )}
                </button>
              </div>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {messages.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                  <p className="mt-4 text-gray-500 text-lg">
                    لا توجد رسائل لعرضها
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between mb-3 gap-2">
                      <div className="flex items-center">
                        <div className="bg-purple-100 text-purple-800 rounded-full p-2 mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-1.003-.21-1.96-.59-2.808A5 5 0 0010 11z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-800">
                          {msg.senderName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-100 py-1 px-3 rounded-full">
                        {new Date(msg.receivedDate).toLocaleString("ar-SA")}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                      <p className="text-gray-700">{msg.messageContent}</p>
                    </div>

                    {msg.replyContent && (
                      <div className="mt-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                        <div className="flex items-start">
                          <div className="bg-green-100 text-green-800 rounded-full p-2 mr-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div>
                            <span className="text-green-700 font-medium">
                              تم الرد:
                            </span>
                            <p className="text-green-800 mt-1">
                              {msg.replyContent}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
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
