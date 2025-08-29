import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { botService } from "@/services/bot.service";
import { adService } from "@/services/ad.service";

// Async Thunks
export const getBotStatus = createAsyncThunk(
  "bot/getStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.getStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في جلب حالة الروبوت"
      );
    }
  }
);

export const startBot = createAsyncThunk(
  "bot/start",
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.start();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في تشغيل الروبوت"
      );
    }
  }
);

export const stopBot = createAsyncThunk(
  "bot/stop",
  async (_, { rejectWithValue }) => {
    try {
      const response = await botService.stop();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في إيقاف الروبوت"
      );
    }
  }
);

export const fetchAds = createAsyncThunk(
  "ads/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adService.fetchAdsFromSite();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في جلب الإعلانات"
      );
    }
  }
);

// تعديل getAds لإضافة التحقق
export const getAds = createAsyncThunk(
  "ads/getAds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adService.getAds();
      // أعد الـ response.data مباشرة
      return response.data; // هذا يحتوي على success, message, data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "فشل في جلب الإعلانات"
      );
    }
  }
);

const botSlice = createSlice({
  name: "bot",
  initialState: {
    // حالة الروبوت
    isRunning: false,
    isLoggedIn: false,
    loading: false,
    error: null,
    lastUpdate: null,

    // الإعلانات
    ads: [],
    adsLoading: false,
    adsError: null,
    selectedAd: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.adsError = null;
    },
    setStatus: (state, action) => {
      state.isRunning = action.payload.isRunning;
      state.isLoggedIn = action.payload.isLoggedIn;
    },
    selectAd: (state, action) => {
      state.selectedAd = action.payload;
    },
    clearAdsError: (state) => {
      state.adsError = null;
    },
    // إضافة reducer جديد لمسح الإعلانات
    clearAds: (state) => {
      state.ads = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // حالة الروبوت
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
      .addCase(startBot.fulfilled, (state, action) => {
        state.loading = false;
        state.isRunning = true;
        state.isLoggedIn = action.payload.isLoggedIn;
        state.lastUpdate = new Date().toISOString();
        // إزالة الجلب التلقائي للإعلانات هنا
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
        state.isLoggedIn = false;
        state.lastUpdate = new Date().toISOString();
        // مسح الإعلانات عند إيقاف البوت
        state.ads = [];
      })
      .addCase(stopBot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // الإعلانات
      .addCase(fetchAds.pending, (state) => {
        state.adsLoading = true;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.adsLoading = false;
        state.ads = action.payload.data || action.payload;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.adsLoading = false;
        state.adsError = action.payload;
      })
      .addCase(getAds.pending, (state) => {
        state.adsLoading = true;
      })
      .addCase(getAds.fulfilled, (state, action) => {
        state.adsLoading = false;
        // تحقق من وجود data
        state.ads = action.payload.data || [];
        state.adsError = null;
      })
      .addCase(getAds.rejected, (state, action) => {
        state.adsLoading = false;
        state.adsError = action.payload || "فشل في جلب الإعلانات";
      });
  },
});

export const { clearError, setStatus, selectAd, clearAdsError, clearAds } =
  botSlice.actions;
export default botSlice.reducer;
