import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type RequestPart = "body" | "query" | "params";

/**
 * Factory de middleware de validation Zod.
 * Valide `req[part]` avec le schéma donné et stocke le résultat parsé
 * dans `res.locals[part]` (on n'écrit pas dans req.query/req.params :
 * en Express 5 ces propriétés n'ont plus de setter).
 */
export const validate =
  (schema: ZodType, part: RequestPart) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[part]);
    if (!parsed.success) {
      res.status(400).json({
        message: "Données invalides",
        errors: parsed.error.flatten(),
      });
      return;
    }
    res.locals[part] = parsed.data;
    next();
  };
