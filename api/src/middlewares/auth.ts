import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../config/auth.ts";
import { pool } from "../db.ts";
import { ForbiddenError } from "../errors/httpError.ts";
import type { User } from "../models/user.ts";
import { AuthRepository } from "../repositories/authRepository.ts";
import { AuthService } from "../services/authService.ts";

const authService = new AuthService(new AuthRepository(pool));

function readCookie(req: Request, name: string): string | undefined {
  return req.headers.cookie
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = readCookie(req, AUTH_COOKIE_NAME);
  res.locals.user = await authService.authenticate(token);
  next();
};

const adminOnly = (_req: Request, res: Response, next: NextFunction): void => {
  const user = res.locals.user as User;
  if (user.role !== "admin") {
    throw new ForbiddenError("Accès réservé aux administrateurs");
  }
  next();
};

export const requireAdmin = [authenticate, adminOnly];
