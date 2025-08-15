import express from "express";
import {
  createAccount,
  getAccounts,
  testAccount,
} from "./account.controller.js";
import protect from "../../middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createAccount);
router.get("/", getAccounts);
router.get("/:id/test", testAccount);

export default router;