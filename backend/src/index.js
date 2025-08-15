import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { startSchedulers } from "./modules/scheduler/adScheduler.js";
import MessageScheduler from "./modules/scheduler/messageScheduler.js"; 
import { errorHandler } from "./utils/error.js";

const app = express();
dotenv.config();

// بعد الاتصال بقاعدة البيانات
connectDb()

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

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
});

startSchedulers();
MessageScheduler.start(); 

app.use(errorHandler);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
