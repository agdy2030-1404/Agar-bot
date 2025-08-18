import express from "express";
import {
  initializeBot,
  updateBotSettings,
  addReplyTemplate,
  getBotStatus,
} from "./bot.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.get("/init", verifyToken, initializeBot);
router.put("/settings", verifyToken, updateBotSettings);
router.post("/templates", verifyToken, addReplyTemplate);
router.get("/status", verifyToken, getBotStatus);

export default router;
