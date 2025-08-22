'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTemplate, fetchTemplates } from '@/redux/messages/messageSlice';

const AutoReplyManager = () => {
  const dispatch = useDispatch();
  const { templates, loading, error } = useSelector((state) => state.messages);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'custom'
  });

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createTemplate(formData)).then(() => {
      setFormData({ name: '', content: '', category: 'custom' });
      setShowForm(false);
    });
  };

  const categories = {
    greeting: 'ترحيب',
    info: 'معلومات',
    price: 'سعر',
    location: 'موقع',
    availability: 'توفر',
    custom: 'مخصص'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">إدارة الردود التلقائية</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showForm ? 'إلغاء' : 'إضافة قالب'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم القالب</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">التصنيف</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {Object.entries(categories).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">محتوى الرد</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows="4"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ القالب'}
          </button>
        </form>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <div key={template._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{template.name}</h3>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                {categories[template.category]}
              </span>
            </div>
            <p className="text-gray-700">{template.content}</p>
            <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
              <span>تم استخدامه {template.useCount} مرة</span>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">تعديل</button>
                <button className="text-red-600 hover:text-red-800">حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoReplyManager;