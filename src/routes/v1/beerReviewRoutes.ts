import { Router } from "express";
import { BeerReviewController } from "../../controllers/beerReviewController.ts";
import { pool } from "../../db.ts";
import { authenticate } from "../../middlewares/auth.ts";
import { validate } from "../../middlewares/validate.ts";
import { BeerReviewRepository } from "../../repositories/beerReviewRepository.ts";
import {
  beerReviewParamsSchema,
  createBeerReviewSchema,
  patchBeerReviewSchema,
} from "../../schemas/beerReviewSchema.ts";
import { beerIdParamSchema } from "../../schemas/beerSchema.ts";
import { BeerReviewService } from "../../services/beerReviewService.ts";

const beerReviewRepository = new BeerReviewRepository(pool);
const beerReviewService = new BeerReviewService(beerReviewRepository);
const beerReviewController = new BeerReviewController(beerReviewService);

// mergeParams : indispensable, :id est déclaré par le routeur parent (beerRoutes).
const router = Router({ mergeParams: true });

// Écriture : authenticate seul (tout compte connecté). Le contrôle
// « auteur / admin » est une règle métier, il vit dans BeerReviewService.

// Route pour lister les avis d'une bière (publique)
router.get(
  "/",
  validate(beerIdParamSchema, "params"),
  beerReviewController.getAllByBeerId,
);

// Route pour ajouter un avis : l'auteur est l'utilisateur du jeton
router.post(
  "/",
  authenticate,
  validate(beerIdParamSchema, "params"),
  validate(createBeerReviewSchema, "body"),
  beerReviewController.addOne,
);

// Route pour modifier un avis (auteur uniquement)
router.patch(
  "/:reviewId",
  authenticate,
  validate(beerReviewParamsSchema, "params"),
  validate(patchBeerReviewSchema, "body"),
  beerReviewController.updateOneById,
);

// Route pour supprimer un avis (auteur ou admin)
router.delete(
  "/:reviewId",
  authenticate,
  validate(beerReviewParamsSchema, "params"),
  beerReviewController.deleteOneById,
);

export default router;
