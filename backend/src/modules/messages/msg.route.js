import express from "express";
import * as msgController from "./msg.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.get("/", verifyToken, msgController.getMessages);
router.post("/process", verifyToken, msgController.processMessages); // للجميع
router.post("/process/:adId", verifyToken, msgController.processMessages); // لإعلان محدد
router.post("/process-all", verifyToken, msgController.processAllMessages);
router.get("/ads", verifyToken, msgController.getUserAds); // جديد


export default router;