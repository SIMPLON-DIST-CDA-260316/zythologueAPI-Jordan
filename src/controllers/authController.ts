import type { Request, Response } from "express";
import type { RegisterInput } from "../schemas/authSchema.ts";
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
}
