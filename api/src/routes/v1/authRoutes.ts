import { Router } from "express";
import { AuthController } from "../../controllers/authController.ts";
import { pool } from "../../db.ts";
import { authenticate } from "../../middlewares/auth.ts";
import { loginRateLimiter } from "../../middlewares/rateLimit.ts";
import { validate } from "../../middlewares/validate.ts";
import { AuthRepository } from "../../repositories/authRepository.ts";
import { loginSchema, registerSchema } from "../../schemas/authSchema.ts";
import { AuthService } from "../../services/authService.ts";

const authRepository = new AuthRepository(pool);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

const router = Router();

router.post(
  "/register",
  validate(registerSchema, "body"),
  authController.register,
);

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema, "body"),
  authController.login,
);

router.get("/me", authenticate, authController.me);

export default router;
