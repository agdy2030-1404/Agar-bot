import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messageService from '../../services/message.service';

// جلب الرسائل
export const fetchMessages = createAsyncThunk(
  'messages/fetch',
  async ({ status, page, limit }, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages(status, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب الرسائل');
    }
  }
);

// تشغيل المعالجة التلقائية
export const processMessages = createAsyncThunk(
  'messages/process',
  async (adId = null, { rejectWithValue }) => {
    try {
      const response = await messageService.processMessages(adId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في معالجة الرسائل');
    }
  }
);

// معالجة جميع الإعلانات
export const processAllMessages = createAsyncThunk(
  'messages/processAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.processAllMessages();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في معالجة جميع الإعلانات');
    }
  }
);

// جلب القوالب
export const fetchTemplates = createAsyncThunk(
  'messages/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getTemplates();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب القوالب');
    }
  }
);

// إنشاء قالب جديد
export const createTemplate = createAsyncThunk(
  'messages/createTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await messageService.createTemplate(templateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إنشاء القالب');
    }
  }
);

// جلب إعلانات المستخدم
export const fetchUserAds = createAsyncThunk(
  'messages/fetchUserAds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getUserAds();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب الإعلانات');
    }
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    messages: [],
    templates: [],
    userAds: [], // جديد
    loading: false,
    processing: false,
    processingAll: false, // جديد
    error: null,
    lastFetch: null,
    lastProcess: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.data || [];
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // process messages
      .addCase(processMessages.pending, (state) => {
        state.processing = true;
      })
      .addCase(processMessages.fulfilled, (state, action) => {
        state.processing = false;
        state.lastProcess = new Date().toISOString();
      })
      .addCase(processMessages.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })

      // process all messages
      .addCase(processAllMessages.pending, (state) => {
        state.processingAll = true;
      })
      .addCase(processAllMessages.fulfilled, (state, action) => {
        state.processingAll = false;
      })
      .addCase(processAllMessages.rejected, (state, action) => {
        state.processingAll = false;
        state.error = action.payload;
      })

      // templates
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templates = action.payload.data || [];
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload.data);
      })

      // user ads
      .addCase(fetchUserAds.fulfilled, (state, action) => {
        state.userAds = action.payload.data || [];
      });
  }
});

export const { clearError } = messageSlice.actions;
export default messageSlice.reducer;