import express from "express";
import * as authController from "./auth.controller.js";
import { registerShcema, loginShcema } from "./auth.schema.js";
import { validateZod } from "../../middlewares/validate-zod.js";

const router = express.Router();

router.post("/register", validateZod(registerShcema), authController.register);
router.post("/login", validateZod(loginShcema), authController.login);
router.get("/logout", authController.logout);

export default router;