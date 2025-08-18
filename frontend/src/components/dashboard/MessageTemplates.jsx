// app/dashboard/MessageTemplates.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCopy,
  FaSearch,
  FaEye,
} from "react-icons/fa";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplateApi,
  searchTemplates,
} from "../../services/messageTemplate.service";
import { toast } from "react-toastify";

const MessageTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ title: "", content: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewContent, setPreviewContent] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    content: "",
  });

  const validateInputs = () => {
    const errors = {};
    if (!newTemplate.title.trim()) {
      errors.title = "العنوان مطلوب";
    } else if (newTemplate.title.length > 100) {
      errors.title = "العنوان يجب أن يكون أقل من 100 حرف";
    }

    if (!newTemplate.content.trim()) {
      errors.content = "المحتوى مطلوب";
    } else if (newTemplate.content.length > 1000) {
      errors.content = "المحتوى يجب أن يكون أقل من 1000 حرف";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const { templates } = await getTemplates();
        setTemplates(templates);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleAddTemplate = async () => {
    if (!validateInputs()) return;

    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast.error("الرجاء إدخال عنوان ومحتوى للقالب");
      return;
    }

    try {
      setIsLoading(true);
      if (editingId) {
        const { template } = await updateTemplate(editingId, newTemplate);
        setTemplates((prev) => [
          template,
          ...prev.filter((t) => t._id !== editingId),
        ]);
        setEditingId(null);
        toast.success("تم تحديث القالب بنجاح ✅");
      } else {
        const { template } = await createTemplate(newTemplate);
        setTemplates((prev) => [template, ...prev]);
        toast.success("تم إضافة القالب بنجاح ✅");
      }
      setNewTemplate({ title: "", content: "" });
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error(error.response?.data?.message || "فشل في حفظ القالب ❌");
    } finally {
      setIsLoading(false);
    }
  };
  const deleteTemplate = async (id) => {
    try {
      await deleteTemplateApi(id);
      setTemplates((prev) => prev.filter((t) => t._id !== id));
      toast.success("تم حذف القالب بنجاح 🗑️");
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("فشل في حذف القالب ❌");
    }
  };

  const editTemplate = (template) => {
    setNewTemplate({ title: template.title, content: template.content });
    setEditingId(template._id);
    setIsAdding(true);
  };

  const copyTemplate = (content) => {
    navigator.clipboard.writeText(content);
    toast.info("تم نسخ القالب 📋");
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.trim() === "") {
      const { templates } = await getTemplates();
      setTemplates(templates);
    } else {
      try {
        const { templates } = await searchTemplates(query);
        setTemplates(templates);
      } catch (error) {
        console.error("Search failed:", error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-3 md:mb-0">
          قوالب الردود التلقائية
        </h2>

        <div className="flex space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input
              type="text"
              placeholder="ابحث في القوالب..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
              setNewTemplate({ title: "", content: "" });
            }}
            className="btn-primary flex items-center whitespace-nowrap"
          >
            <FaPlus className="ml-2" />{" "}
            {editingId ? "تعديل قالب" : "إضافة قالب"}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 mx-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              عنوان القالب
            </label>
            <input
              type="text"
              value={newTemplate.title}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, title: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="مثال: الرد الأساسي"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نص الرد
            </label>
            <textarea
              value={newTemplate.content}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, content: e.target.value })
              }
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="اكتب نص الرد التلقائي هنا..."
            ></textarea>
          </div>
          <div className="flex space-x-2">
            <button onClick={handleAddTemplate} className="btn-primary flex-1">
              {editingId ? "تحديث القالب" : "حفظ القالب"}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="btn-outline flex-1"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="p-8 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="text-2xl text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-700">
            لا توجد قوالب مطابقة للبحث
          </h3>
          <p className="text-gray-500 mt-1">
            جرب كلمات بحث مختلفة أو أضف قالباً جديداً
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {templates.map((template) => (
            <div
              key={template._id}
              className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all duration-200 relative group min-h-[150px] flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800 line-clamp-1 flex-1">
                  {template.title}
                </h3>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setPreviewContent(template.content)}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                    title="معاينة القالب"
                  >
                    <FaEye size={14} />
                  </button>
                  <button
                    onClick={() => copyTemplate(template.content)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    title="نسخ القالب"
                  >
                    <FaCopy size={14} />
                  </button>
                  <button
                    onClick={() => editTemplate(template)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    title="تعديل القالب"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("هل أنت متأكد من حذف هذا القالب؟")) {
                        deleteTemplate(template._id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                    title="حذف القالب"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-2 line-clamp-3 flex-1">
                {template.content}
              </p>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(template.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* معاينة القالب */}
      {previewContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">معاينة القالب</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {previewContent}
            </p>
            <button
              onClick={() => setPreviewContent(null)}
              className="btn-primary mt-4 w-full"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageTemplates;
