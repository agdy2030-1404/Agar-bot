import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import botService from '../../services/bot.service';

export const getBotStatus = createAsyncThunk(
  'bot/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.getStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب حالة الروبوت');
    }
  }
);

export const startBot = createAsyncThunk(
  'bot/start',
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.start();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تشغيل الروبوت');
    }
  }
);

export const stopBot = createAsyncThunk(
  'bot/stop',
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.stop();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إيقاف الروبوت');
    }
  }
);

const botSlice = createSlice({
  name: 'bot',
  initialState: {
    isRunning: false,
    isLoggedIn: false,
    loading: false,
    error: null,
    lastUpdate: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setStatus: (state, action) => {
      state.isRunning = action.payload.isRunning;
      state.isLoggedIn = action.payload.isLoggedIn;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBotStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBotStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isRunning = action.payload.isRunning;
        state.isLoggedIn = action.payload.isLoggedIn;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(getBotStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(startBot.pending, (state) => {
        state.loading = true;
      })
      .addCase(startBot.fulfilled, (state) => {
        state.loading = false;
        state.isRunning = true;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(startBot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(stopBot.pending, (state) => {
        state.loading = true;
      })
      .addCase(stopBot.fulfilled, (state) => {
        state.loading = false;
        state.isRunning = false;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(stopBot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setStatus } = botSlice.actions;
export default botSlice.reducer;