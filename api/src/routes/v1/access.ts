import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { ForbiddenError } from "../../errors/httpError.ts";
import { authenticate, requireAdmin } from "../../middlewares/auth.ts";

// Moindre privilège : toute route absente de cette liste est refusée, même
// pour un admin. Une nouvelle route doit être déclarée ici pour exister.
const allow = (_req: Request, _res: Response, next: NextFunction): void =>
  next("router"); // sort de ce routeur : la requête continue vers les routes

const router = Router();

// Public
router.get(
  [
    "/beers",
    "/beers/:id",
    "/beers/:id/photos",
    "/beers/:id/reviews",
    "/breweries",
    "/breweries/:id",
    "/breweries/:id/photos",
    "/categories",
    "/categories/:id",
    "/ingredients",
    "/ingredients/:id",
  ],
  allow,
);
router.post(["/auth/register", "/auth/login", "/auth/logout"], allow);

// Connecté
router.get("/auth/me", authenticate, allow);
router.post("/beers/:id/reviews", authenticate, allow);
router.patch("/beers/:id/reviews/:reviewId", authenticate, allow);
router.delete("/beers/:id/reviews/:reviewId", authenticate, allow);

// Admin
router.get(["/beer-logs", "/stats"], requireAdmin, allow);
router.post(
  [
    "/beers",
    "/breweries",
    "/categories",
    "/ingredients",
    "/beers/:id/photos",
    "/breweries/:id/photos",
    "/beers/:id/categories",
    "/beers/:id/ingredients",
  ],
  requireAdmin,
  allow,
);
router.patch(
  ["/beers/:id", "/breweries/:id", "/categories/:id", "/ingredients/:id"],
  requireAdmin,
  allow,
);
router.delete(
  [
    "/beers/:id",
    "/breweries/:id",
    "/categories/:id",
    "/ingredients/:id",
    "/beers/:id/photos/:photoId",
    "/breweries/:id/photos/:photoId",
    "/beers/:id/categories/:categoryId",
    "/beers/:id/ingredients/:ingredientId",
  ],
  requireAdmin,
  allow,
);

// Par défaut : refusé
router.use(() => {
  throw new ForbiddenError("Accès refusé");
});

export default router;
