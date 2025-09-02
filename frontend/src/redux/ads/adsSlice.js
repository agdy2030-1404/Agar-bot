import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adsService from "../../services/ad.service";

// Async Thunks
export const fetchUserAds = createAsyncThunk(
  "ads/fetchUserAds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adsService.fetchUserAds();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "فشل في جلب الإعلانات من الموقع");
    }
  }
);

export const getAds = createAsyncThunk(
  "ads/getAds",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adsService.getAds(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "فشل في جلب الإعلانات");
    }
  }
);

export const getAdDetails = createAsyncThunk(
  "ads/getAdDetails",
  async (adId, { rejectWithValue }) => {
    try {
      const response = await adsService.getAdDetails(adId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "فشل في جلب تفاصيل الإعلان");
    }
  }
);

export const updateAdStatus = createAsyncThunk(
  "ads/updateAdStatus",
  async ({ adId, status }, { rejectWithValue }) => {
    try {
      const response = await adsService.updateAdStatus(adId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "فشل في تحديث حالة الإعلان");
    }
  }
);

export const deleteAd = createAsyncThunk(
  "ads/deleteAd",
  async (adId, { rejectWithValue }) => {
    try {
      await adsService.deleteAd(adId);
      return adId;
    } catch (error) {
      return rejectWithValue(error.message || "فشل في حذف الإعلان");
    }
  }
);

export const updateSingleAd = createAsyncThunk(
  "ads/updateSingleAd",
  async (adId, { rejectWithValue }) => {
    try {
      const response = await adsService.updateSingleAd(adId);
      return { adId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message || "فشل في تحديث الإعلان");
    }
  }
);

export const scheduleAdUpdates = createAsyncThunk(
  "ads/scheduleAdUpdates",
  async ({ minHours, maxHours }, { rejectWithValue }) => {
    try {
      const response = await adsService.scheduleAdUpdates(minHours, maxHours);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "فشل في جدولة التحديثات");
    }
  }
);

export const renewAllAds = createAsyncThunk(
  "ads/renewAllAds",
  async (_, { rejectWithValue }) => {
    try {
      const results = await adsService.renewAllAds();
      return results;
    } catch (error) {
      return rejectWithValue(error.message || "فشل في تجديد جميع الإعلانات");
    }
  }
);

const adsSlice = createSlice({
  name: "ads",
  initialState: {
    ads: [],
    currentAd: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
    updateQueue: [],
    lastFetch: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAd: (state) => {
      state.currentAd = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    selectAd: (state, action) => {
      state.selectedAd = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserAds
      .addCase(fetchUserAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAds.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchUserAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getAds
      .addCase(getAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAds.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload.docs || action.payload.data || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          pages: action.payload.pages || 0,
        };
      })
      .addCase(getAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getAdDetails
      .addCase(getAdDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAd = action.payload;
      })
      .addCase(getAdDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateAdStatus
      .addCase(updateAdStatus.fulfilled, (state, action) => {
        const updatedAd = action.payload;
        const index = state.ads.findIndex((ad) => ad.adId === updatedAd.adId);
        if (index !== -1) {
          state.ads[index] = updatedAd;
        }
      })

      // deleteAd
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.ads = state.ads.filter((ad) => ad.adId !== action.payload);
      })

      // updateSingleAd
      .addCase(updateSingleAd.fulfilled, (state, action) => {
        const { adId, ...updateData } = action.payload;
        const index = state.ads.findIndex((ad) => ad.adId === adId);
        if (index !== -1) {
          state.ads[index] = { ...state.ads[index], ...updateData };
        }
      })

      // renewAllAds
      .addCase(renewAllAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(renewAllAds.fulfilled, (state, action) => {
        state.loading = false;
        // تحديث الإعلانات التي تم تجديدها بنجاح
        action.payload.forEach((result) => {
          if (result.success) {
            const index = state.ads.findIndex((ad) => ad.adId === result.adId);
            if (index !== -1) {
              state.ads[index].lastUpdated = new Date().toISOString();
              state.ads[index].updateCount =
                (state.ads[index].updateCount || 0) + 1;
            }
          }
        });
      })
      .addCase(renewAllAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentAd, setPagination, selectAd } =
  adsSlice.actions;
export default adsSlice.reducer;