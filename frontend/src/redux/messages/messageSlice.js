import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messageService from '../../services/message.service';

export const fetchMessages = createAsyncThunk(
  'messages/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب الرسائل');
    }
  }
);

export const fetchTemplates = createAsyncThunk(
  'messages/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getTemplates();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب القوالب');
    }
  }
);

export const createTemplate = createAsyncThunk(
  'messages/createTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await messageService.createTemplate(templateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إنشاء القالب');
    }
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    messages: [],
    templates: [],
    loading: false,
    error: null,
    lastFetch: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addMessage: (state, action) => {
      state.messages.unshift(action.payload);
    },
    updateTemplate: (state, action) => {
      const index = state.templates.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    deleteTemplate: (state, action) => {
      state.templates = state.templates.filter(t => t._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.data?.docs || action.payload.data || [];
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templates = action.payload.data || [];
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload.data);
      });
  }
});

export const { clearError, addMessage, updateTemplate, deleteTemplate } = messageSlice.actions;
export default messageSlice.reducer;