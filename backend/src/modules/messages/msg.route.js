import express from "express";
import * as msgController from "./msg.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.get("/", verifyToken, msgController.getMessages);
router.post("/process", verifyToken, msgController.processMessages); // للجميع
router.post("/process/:adId", verifyToken, msgController.processMessages); // لإعلان محدد
router.post("/process-all", verifyToken, msgController.processAllMessages);
router.get("/templates", verifyToken, msgController.getTemplates);
router.post("/templates", verifyToken, msgController.createTemplate);
router.get("/ads", verifyToken, msgController.getUserAds); // جديد
router.put("/templates/:id", verifyToken, msgController.updateTemplate); // إضافة التعديل
router.delete("/templates/:id", verifyToken, msgController.deleteTemplate); // إضافة الحذف

export default router;