// routes/stats.routes.js
import express from "express";
import { getUserStats } from "./stats.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

// Get user statistics
router.get("/", verifyToken, getUserStats);

export default router;
