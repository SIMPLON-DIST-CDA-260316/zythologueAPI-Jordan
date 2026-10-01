import { Router } from "express";
import { BeerCategoryController } from "../../controllers/beerCategoryController.ts";
import { pool } from "../../db.ts";
import { requireAdmin } from "../../middlewares/auth.ts";
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
const beerCategoryController = new BeerCategoryController(beerCategoryService);

// mergeParams : indispensable, :id est déclaré par le routeur parent (beerRoutes).
const router = Router({ mergeParams: true });

// Route pour associer une catégorie à une bière
router.post(
  "/",
  requireAdmin,
  validate(beerIdParamSchema, "params"),
  validate(createBeerCategorySchema, "body"),
  beerCategoryController.addOne,
);

// Route pour dissocier une catégorie d'une bière
router.delete(
  "/:categoryId",
  requireAdmin,
  validate(beerCategoryParamsSchema, "params"),
  beerCategoryController.deleteOneById,
);

export default router;
