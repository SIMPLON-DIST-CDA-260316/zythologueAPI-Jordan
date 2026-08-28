import { Router } from "express";
import { BeerCategoryController } from "../../controllers/beerCategoryController.ts";
import { pool } from "../../db.ts";
import { validate } from "../../middlewares/validate.ts";
import { BeerCategoryRepository } from "../../repositories/beerCategoryRepository.ts";
import { CategoryRepository } from "../../repositories/categoryRepository.ts";
import {
  beerCategoryParamsSchema,
  createBeerCategorySchema,
} from "../../schemas/beerCategorySchema.ts";
import { beerIdParamSchema } from "../../schemas/beerSchema.ts";
import { BeerCategoryService } from "../../services/beerCategoryService.ts";

const beerCategoryRepository = new BeerCategoryRepository(pool);
const categoryRepository = new CategoryRepository(pool);
const beerCategoryService = new BeerCategoryService(
  beerCategoryRepository,
  categoryRepository,
);
const beerCategoryController = new BeerCategoryController(
  beerCategoryService,
);

// mergeParams : indispensable, :id est déclaré par le routeur parent (beerRoutes).
const router = Router({ mergeParams: true });

// Quand l'auth sera en place, POST / DELETE recevront un middleware de rôle,
// à insérer entre le validate(...) et le contrôleur.

// Route pour associer une catégorie à une bière
router.post(
  "/",
  validate(beerIdParamSchema, "params"),
  validate(createBeerCategorySchema, "body"),
  beerCategoryController.addOne,
);

// Route pour dissocier une catégorie d'une bière
router.delete(
  "/:categoryId",
  validate(beerCategoryParamsSchema, "params"),
  beerCategoryController.deleteOneById,
);

export default router;
