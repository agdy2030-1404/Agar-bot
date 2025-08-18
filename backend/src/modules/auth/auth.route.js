import express from "express";
import * as authController from "./auth.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/notifications", verifyToken, authController.getUnreadNotifications);
router.put("/:notificationId/read", verifyToken, authController.markNotificationRead);
export default router;
