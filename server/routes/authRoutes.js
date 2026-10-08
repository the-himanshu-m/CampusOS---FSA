import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import authenticate from "../middleware/authMiddleware.js";
import { validateRegister, validateLogin } from "../validators/authValidators.js";
import loginLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", loginLimiter, validateLogin, login);
router.get("/me", authenticate, getMe);

export default router;