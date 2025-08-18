// routes/dashboard.routes.js
import express from "express";
import { getDashboardData } from "./dashboard.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

// Get all dashboard data
router.get("/", verifyToken, getDashboardData);

export default router;