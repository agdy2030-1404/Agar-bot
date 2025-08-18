import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.route.js";
import messageTemplateRoutes from "./modules/messageTemplate/messageTemplate.route.js";
import botRoutes from "./modules/bot/bot.route.js";
import adRoutes from "./modules/ad/ads.route.js";
import activityRoutes from "./modules/activity/activity.route.js";
import statsRoutes from "./modules/stats/stats.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.route.js";

const app = express();
dotenv.config();

// بعد الاتصال بقاعدة البيانات
connectDb();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Content-Length",
      "X-Requested-With",
    ],
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/message-templates", messageTemplateRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/dashboard", dashboardRoutes);

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
