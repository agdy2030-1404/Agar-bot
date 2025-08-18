// routes/messageTemplate.routes.js
import express from "express";
import {
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  searchTemplates,
} from "./messageTemplate.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyToken, createTemplate);
router.get("/", verifyToken, getTemplates);
router.put("/:id", verifyToken, updateTemplate);
router.delete("/:id", verifyToken, deleteTemplate);
router.get("/search", verifyToken, searchTemplates);

export default router;
