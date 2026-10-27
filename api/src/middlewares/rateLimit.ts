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

// Chaque inscription coûte un hash argon2 (64 Mo de RAM) : sans limite, une
// rafale d'inscriptions anonymes sature la mémoire de l'API. Le compteur monte
// dès l'arrivée de la requête : au plus 10 hashs simultanés par IP
export const registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(
      new TooManyRequestsError(
        "Trop d'inscriptions depuis cette adresse, réessayez dans 15 minutes",
      ),
    ),
});
