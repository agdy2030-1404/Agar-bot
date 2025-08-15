// app/dashboard/MessageTemplates.jsx
import React, { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaCopy, FaSearch } from "react-icons/fa";

const MessageTemplates = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      title: "الرد الأساسي",
      content: "مرحباً، شكراً لاهتمامك بالإعلان. هل لديك أي استفسار محدد؟",
    },
    {
      id: 2,
      title: "طلب معلومات",
      content: "أهلاً بك، يمكنني إرسال المزيد من الصور والمعلومات إذا كنت مهتماً.",
    },
    {
      id: 3,
      title: "التواصل عبر الهاتف",
      content: "شكراً لاهتمامك. يمكنك التواصل معي عبر الهاتف على الرقم 0555555555",
    },
    {
      id: 4,
      title: "الرد على استفسار السعر",
      content: "شكراً لسؤالك عن السعر. السعر المذكور في الإعلان نهائي، ولكني مستعد للنقاش عند المعاينة.",
    },
  ]);

  const [newTemplate, setNewTemplate] = useState({ title: "", content: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleAddTemplate = () => {
    if (newTemplate.title && newTemplate.content) {
      if (editingId) {
        setTemplates(templates.map(t => 
          t.id === editingId ? {...newTemplate, id: editingId} : t
        ));
        setEditingId(null);
      } else {
        setTemplates([...templates, { ...newTemplate, id: Date.now() }]);
      }
      setNewTemplate({ title: "", content: "" });
      setIsAdding(false);
    }
  };

  const deleteTemplate = (id) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const editTemplate = (template) => {
    setNewTemplate({ title: template.title, content: template.content });
    setEditingId(template.id);
    setIsAdding(true);
  };

  const copyTemplate = (content) => {
    navigator.clipboard.writeText(content);
    alert("تم نسخ القالب!");
  };

  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    template.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-3 md:mb-0">قوالب الردود التلقائية</h2>
        
        <div className="flex space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input
              type="text"
              placeholder="ابحث في القوالب..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <FaPlus className="ml-2" /> {editingId ? "تعديل قالب" : "إضافة قالب"}
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
            <button 
              onClick={handleAddTemplate} 
              className="btn-primary flex-1"
            >
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

      {filteredTemplates.length === 0 ? (
        <div className="p-8 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="text-2xl text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-700">لا توجد قوالب مطابقة للبحث</h3>
          <p className="text-gray-500 mt-1">جرب كلمات بحث مختلفة أو أضف قالباً جديداً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all duration-200 relative group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800">{template.title}</h3>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => copyTemplate(template.content)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    title="نسخ القالب"
                  >
                    <FaCopy />
                  </button>
                  <button 
                    onClick={() => editTemplate(template)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    title="تعديل القالب"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                    title="حذف القالب"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-2">
                {template.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageTemplates;