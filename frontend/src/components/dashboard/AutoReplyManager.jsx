"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTemplate,
  fetchTemplates,
  updateTemplate,
  deleteTemplate,
  clearError,
} from "@/redux/messages/messageSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AutoReplyManager() {
  const dispatch = useDispatch();
  const { templates, loading, error } = useSelector((state) => state.messages);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    category: "custom",
  });
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingTemplate) {
      // تحديث القالب الحالي
      dispatch(
        updateTemplate({
          templateId: editingTemplate._id,
          templateData: formData,
        })
      ).then((result) => {
        if (!result.error) {
          setFormData({ name: "", content: "", category: "custom" });
          setEditingTemplate(null);
          setShowForm(false);

          toast.success("تم تحديث قالب الحراج بنجاح!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
            rtl: true,
          });
        }
      });
    } else {
      // إنشاء قالب جديد
      dispatch(createTemplate(formData)).then((result) => {
        if (!result.error) {
          setFormData({ name: "", content: "", category: "custom" });
          setShowForm(false);

          toast.success("تم إنشاء قالب الحراج بنجاح!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
            rtl: true,
          });
        }
      });
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category,
    });
    setShowForm(true);
  };

  const handleDelete = (template) => {
    setDeletingTemplate(template);
  };

  const confirmDelete = () => {
    if (deletingTemplate) {
      dispatch(deleteTemplate(deletingTemplate._id)).then((result) => {
        if (!result.error) {
          setDeletingTemplate(null);
          toast.success("تم حذف القالب بنجاح!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
            rtl: true,
          });
        }
      });
    }
  };

  const cancelForm = () => {
    setFormData({ name: '', content: '', category: 'custom' });
    setEditingTemplate(null);
    setShowForm(false);
  };


  const categories = {
    greeting: "ترحيب",
    price: "سعر",
    availability: "توفر",
    location: "موقع",
    custom: "مخصص",
  };

  const getCategoryColor = (category) => {
    const colors = {
      greeting: "bg-blue-100 text-blue-800",
      price: "bg-amber-100 text-amber-800",
      availability: "bg-green-100 text-green-800",
      location: "bg-purple-100 text-purple-800",
      custom: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.custom;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-6 text-white">
            <h2 className="text-2xl font-bold">قوالب ردود الحراج</h2>
            <p className="text-cyan-200 mt-1">
              إنشاء وإدارة قوالب الردود التلقائية لمنصة حراج
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800">
                  قوالب الردود
                </h3>
                <p className="text-gray-500 text-sm">
                  إجمالي القوالب: {templates.length}
                </p>
              </div>

              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {showForm ? "إلغاء" : "إضافة قالب جديد"}
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="mb-8 p-5 border border-gray-200 rounded-xl bg-gray-50 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingTemplate
                    ? "تعديل قالب الحراج"
                    : "إضافة قالب جديد للحراج"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم القالب
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="أدخل اسم القالب"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التصنيف
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    >
                      {Object.entries(categories).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    محتوى الرد
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="أدخل محتوى الرد التلقائي للحراج..."
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
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
                        جاري الحفظ...
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
                        {editingTemplate ? "تحديث القالب" : "حفظ القالب"}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={cancelForm}
                    className="bg-gray-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 shadow-md"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            {/* نافذة تأكيد الحذف */}
            {deletingTemplate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    تأكيد الحذف
                  </h3>
                  <p className="text-gray-600 mb-6">
                    هل أنت متأكد من أنك تريد حذف القالب "{deletingTemplate.name}
                    "؟ هذا الإجراء لا يمكن التراجع عنه.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setDeletingTemplate(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            )}

            {templates.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4 text-gray-500 text-lg">
                  لا توجد قوالب ردود للحراج
                </p>
                <p className="text-gray-400">
                  ابدأ بإضافة قالب رد جديد مخصص لحراج
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {templates.map((template) => (
                  <div
                    key={template._id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {template.name}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(
                          template.category
                        )}`}
                      >
                        {categories[template.category] || template.category}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {template.content}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                            clipRule="evenodd"
                          />
                        </svg>
                        تم استخدامه {template.usageCount || 0} مرة
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1 text-sm"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(template)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center gap-1 text-sm"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
