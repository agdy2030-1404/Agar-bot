import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import botReducer from "./bot/botSlice";
import adsReducer from "./ads/adsSlice";
import messageReducer from "./messages/messageSlice";
import { persistReducer, persistStore } from "redux-persist";

// تحقق إذا كانت البيئة هي المتصفح
let storage;
if (typeof window !== "undefined") {
  // في حال كان في المتصفح
  storage = require("redux-persist/lib/storage").default;
} else {
  // في حال كان في الخادم
  storage = {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  };
}

const rootReducer = combineReducers({
  user: userReducer,
  bot: botReducer,
  ads: adsReducer,
  messages: messageReducer,
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  whitelist: ["user"], // نحافظ على user فقط في التخزين المستمر
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
