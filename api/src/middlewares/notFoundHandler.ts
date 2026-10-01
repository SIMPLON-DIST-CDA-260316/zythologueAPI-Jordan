import type { Request, Response } from "express";

/**
 * Monté après toutes les routes : toute requête qui arrive jusqu'ici ne
 * correspond à aucune route déclarée.
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "Route non trouvée" });
}
