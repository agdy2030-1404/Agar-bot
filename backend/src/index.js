// تحديث ملف index.js لإضافة routes الرسائل
import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.route.js";
import botRoutes from "./modules/bot/bot.route.js";
import adsRoutes from "./modules/ads/ads.route.js";
import msgRoutes from "./modules/messages/msg.route.js"; // إضافة هذا السطر

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
app.use("/api/bot", botRoutes);
app.use("/api/ads", adsRoutes);
app.use('/api/messages', msgRoutes);

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