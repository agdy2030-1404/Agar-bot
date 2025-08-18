import express from "express";
import { getUserAds, renewAd, renewAllAds, syncAds } from "./ads.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

router.get("/", verifyToken, getUserAds);
router.post("/:id/renew", verifyToken, renewAd);
router.post("/renew-all", verifyToken, renewAllAds);
router.post("/sync", verifyToken, syncAds);

export default router;
