import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import { persistReducer, persistStore } from "redux-persist";

// تحقق إذا كانت البيئة هي المتصفح
let storage;
if (typeof window !== "undefined") {
  // في حال كان في المتصفح
  storage = require("redux-persist/lib/storage").default; // استيراد التخزين المحلي
} else {
  // في حال كان في الخادم
  storage = {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  }; // تخزين فارغ يعمل على الخادم فقط
}

const rootReducer = combineReducers({
  user: userReducer,
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
