import express from "express";
import { getActivities } from "./activity.controller.js";
import protect from "../../middlewares/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getActivities);

export default router;