import rateLimit from "express-rate-limit";
import { TooManyRequestsError } from "../errors/httpError.ts";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true, // une connexion réussie ne consomme pas le quota
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(
      new TooManyRequestsError(
        "Trop de tentatives de connexion, réessayez dans 15 minutes",
      ),
    ),
});
