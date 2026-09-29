import type { Request, Response } from "express";
import { AUTH_COOKIE_NAME, JWT_EXPIRES_IN_S } from "../config/auth.ts";
import type { LoginInput, RegisterInput } from "../schemas/authSchema.ts";
import type { AuthService } from "../services/authService.ts";

export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  register = async (_req: Request, res: Response): Promise<void> => {
    const body = res.locals.body as RegisterInput;
    const user = await this.authService.register(body);
    res.status(201).json(user);
  };

  login = async (_req: Request, res: Response): Promise<void> => {
    const body = res.locals.body as LoginInput;
    const token = await this.authService.login(body);
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: JWT_EXPIRES_IN_S * 1000,
    });
    res.status(200).json({ message: "Connexion réussie" });
  };
}
