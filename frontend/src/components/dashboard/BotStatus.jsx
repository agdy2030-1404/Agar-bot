import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getBotStatus,
  startBot,
  stopBot,
  fetchAds,
  startAutoUpdate,
  stopAutoUpdate,
  getSchedulerStatus,
  updateAllAds,
} from "@/redux/bot/botSlice";

export default function BotStatus() {
  const dispatch = useDispatch();
  const { isRunning, isLoggedIn, loading, error } = useSelector(
    (state) => state.bot
  );
  const [loginChecking, setLoginChecking] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState({
    isRunning: false,
    nextUpdate: null,
  });

  useEffect(() => {
    // جلب حالة المجدول عند التحميل
    dispatch(getSchedulerStatus());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getBotStatus());

    const statusInterval = setInterval(() => {
      dispatch(getBotStatus());
    }, 30000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-left",
        rtl: true,
      });
    }
  }, [error]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (schedulerStatus.isRunning) {
        dispatch(getSchedulerStatus());
      }
    }, 60000); // تحديث كل دقيقة

    return () => clearInterval(interval);
  }, [schedulerStatus.isRunning, dispatch]);

  // وفي حالة تغيير حالة التحديث التلقائي
  useEffect(() => {
    dispatch(getSchedulerStatus());
  }, [isRunning, isLoggedIn, dispatch]);

  const handleToggle = async () => {
    if (isRunning) {
      dispatch(stopBot());
      toast.info("جاري إيقاف الروبوت...", {
        position: "top-left",
        rtl: true,
      });
    } else {
      try {
        await dispatch(startBot()).unwrap();
        toast.success("تم تشغيل الروبوت بنجاح", {
          position: "top-left",
          rtl: true,
        });
      } catch (error) {
        console.error("Failed to start bot:", error);
        toast.error("فشل في تشغيل الروبوت", {
          position: "top-left",
          rtl: true,
        });
      }
    }
  };

  const handleFetchAds = () => {
    if (isRunning && isLoggedIn) {
      dispatch(fetchAds());
      toast.info("جاري جلب الإعلانات...", {
        position: "top-left",
        rtl: true,
      });
    } else {
      toast.error("يجب تشغيل الروبوت وتسجيل الدخول أولاً", {
        position: "top-left",
        rtl: true,
      });
    }
  };

  const handleStartAutoUpdate = async () => {
    try {
      await dispatch(startAutoUpdate()).unwrap();
      toast.success("تم تشغيل التحديث التلقائي بنجاح", {
        position: "top-left",
        rtl: true,
      });

      // تحديث حالة المجدول
      dispatch(getSchedulerStatus());
    } catch (error) {
      toast.error("فشل في تشغيل التحديث التلقائي", {
        position: "top-left",
        rtl: true,
      });
    }
  };

  const handleStopAutoUpdate = async () => {
    try {
      await dispatch(stopAutoUpdate()).unwrap();
      toast.success("تم إيقاف التحديث التلقائي بنجاح", {
        position: "top-left",
        rtl: true,
      });

      // تحديث حالة المجدول
      dispatch(getSchedulerStatus());
    } catch (error) {
      toast.error("فشل في إيقاف التحديث التلقائي", {
        position: "top-left",
        rtl: true,
      });
    }
  };

  const handleUpdateAllAds = async () => {
    if (isRunning && isLoggedIn) {
      try {
        await dispatch(updateAllAds()).unwrap();
        toast.success("جاري تحديث جميع الإعلانات...", {
          position: "top-left",
          rtl: true,
        });

        // إعادة جلب الإعلانات بعد التحديث
        setTimeout(() => {
          dispatch(fetchAds());
        }, 5000);
      } catch (error) {
        toast.error("فشل في تحديث الإعلانات", {
          position: "top-left",
          rtl: true,
        });
      }
    } else {
      toast.error("يجب تشغيل الروبوت وتسجيل الدخول إلى حراج أولاً", {
        position: "top-left",
        rtl: true,
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        حالة الروبوت
      </h2>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center mb-3 md:mb-0">
          <div
            className={`w-4 h-4 rounded-full mr-3 shadow-inner ${
              isRunning ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="text-lg font-medium text-gray-700">
            {isRunning ? "متصل" : "غير متصل"}
          </span>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isRunning
              ? "bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 focus:ring-rose-500"
              : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 focus:ring-emerald-500"
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        >
          {loading ? (
            <span className="flex items-center">
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
              جاري المعالجة...
            </span>
          ) : isRunning ? (
            "إيقاف التشغيل"
          ) : (
            "بدء التشغيل"
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6 bg-gray-50 p-4 rounded-xl">
        <div className="flex items-center">
          <span className="text-gray-600 ml-2">حالة التسجيل:</span>
          <span
            className={`font-medium flex items-center ${
              isLoggedIn ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {loginChecking ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-1 h-4 w-4"
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
                جاري التحقق...
              </>
            ) : isLoggedIn ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                مسجل الدخول
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                غير مسجل
              </>
            )}
          </span>
        </div>

        <div className="flex items-center">
          <span className="text-gray-600 ml-2">آخر تحديث:</span>
          <span className="font-medium text-gray-700">
            {new Date().toLocaleTimeString("ar-SA")}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={handleFetchAds}
          disabled={!isLoggedIn || !isRunning}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center w-full ${
            !isLoggedIn || !isRunning
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 transform hover:scale-105"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
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
          جلب الإعلانات
        </button>

        {(!isLoggedIn || !isRunning) && (
          <p className="text-sm text-gray-500 mt-3 text-center">
            يجب أن يكون الروبوت متصلاً ومسجلاً الدخول لجلب الإعلانات
          </p>
        )}
      </div>

      <div className="border-t border-orange-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          التحديث التلقائي
        </h3>

        <div className="bg-blue-50 p-4 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-700">حالة التحديث التلقائي:</span>
            <span
              className={`font-medium ${
                schedulerStatus.isRunning ? "text-green-600" : "text-gray-600"
              }`}
            >
              {schedulerStatus.isRunning ? "نشط" : "متوقف"}
            </span>
          </div>

          {schedulerStatus.nextUpdate && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700">موعد التحديث التالي:</span>
              <span className="font-medium text-gray-800">
                {new Date(schedulerStatus.nextUpdate).toLocaleString("ar-SA")}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={handleStartAutoUpdate}
            disabled={!isRunning || !isLoggedIn || schedulerStatus.isRunning}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
              !isRunning || !isLoggedIn || schedulerStatus.isRunning
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600"
            }`}
          >
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            تشغيل التلقائي
          </button>

          <button
            onClick={handleStopAutoUpdate}
            disabled={!schedulerStatus.isRunning}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
              !schedulerStatus.isRunning
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600"
            }`}
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            إيقاف التلقائي
          </button>
        </div>

        <button
          onClick={handleUpdateAllAds}
          disabled={!isLoggedIn || !isRunning}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center w-full mt-3 ${
            !isLoggedIn || !isRunning
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
          }`}
        >
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
          تحديث جميع الإعلانات الآن
        </button>
      </div>

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
