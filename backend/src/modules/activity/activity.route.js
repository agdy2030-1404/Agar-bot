// routes/activity.routes.js
import express from "express";
import {
  getUserActivities,
  getRecentActivities
} from "./activity.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

// Get user activities with pagination
router.get("/", verifyToken, getUserActivities);

// Get recent activities for dashboard
router.get("/recent", verifyToken, getRecentActivities);

export default router;