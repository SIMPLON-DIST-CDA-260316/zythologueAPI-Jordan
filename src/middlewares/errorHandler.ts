import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/httpError.ts";

/**
 * Middleware d'erreur centralisé. Express ne le reconnaît comme tel que
 * grâce à son arité de 4 paramètres (err, req, res, next) — peu importe
 * leurs noms — et il doit être monté en tout dernier dans app.ts.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    // Des octets sont déjà partis : on ne peut plus écrire un nouveau statut,
    // on délègue au handler par défaut d'Express.
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Erreur inattendue : loggée côté serveur pour le débogage, jamais
  // renvoyée telle quelle au client (fuite de stack, message SQL, ...).
  console.error(err);
  res.status(500).json({ message: "Erreur interne du serveur" });
}
