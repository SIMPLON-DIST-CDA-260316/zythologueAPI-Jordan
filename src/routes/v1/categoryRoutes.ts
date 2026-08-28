import { Router } from "express";
import { CategoryController } from "../../controllers/categoryController.ts";
import { pool } from "../../db.ts";
import { validate } from "../../middlewares/validate.ts";
import { CategoryRepository } from "../../repositories/categoryRepository.ts";
import {
  categoryIdParamSchema,
  createCategorySchema,
  getCategoriesQuerySchema,
  patchCategorySchema,
} from "../../schemas/categorySchema.ts";
import { CategoryService } from "../../services/categoryService.ts";

const categoryRepository = new CategoryRepository(pool);
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

const router = Router();

// Quand l'auth sera en place, POST / PATCH / DELETE recevront un middleware de
// rôle, à insérer entre le validate(...) et le contrôleur.

// Route racine de l'API categories : récupère toutes les catégories
router.get(
  "/",
  validate(getCategoriesQuerySchema, "query"),
  categoryController.getAll,
);

// Route pour récupérer une catégorie par son id
router.get(
  "/:id",
  validate(categoryIdParamSchema, "params"),
  categoryController.getOneById,
);

// Route pour supprimer une catégorie par son id.
// Le ON DELETE CASCADE sur beer_category s'occupe de désassocier les bières.
router.delete(
  "/:id",
  validate(categoryIdParamSchema, "params"),
  categoryController.deleteOneById,
);

// Route pour ajouter une catégorie
router.post(
  "/",
  validate(createCategorySchema, "body"),
  categoryController.addOne,
);

// Route pour modifier partiellement une catégorie par son id
router.patch(
  "/:id",
  validate(categoryIdParamSchema, "params"),
  validate(patchCategorySchema, "body"),
  categoryController.updateOneById,
);

export default router;
