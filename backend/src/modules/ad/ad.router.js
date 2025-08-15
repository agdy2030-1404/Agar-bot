import express from "express";
import {
  createAd,
  refreshAd,
  getAds,
} from "./ad.controller.js";
import protect from "../../middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createAd);
router.get("/", getAds);
router.post("/:id/refresh", refreshAd);

export default router;