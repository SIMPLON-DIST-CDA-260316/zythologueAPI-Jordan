import { Router } from "express";
import { IngredientController } from "../../controllers/ingredientController.ts";
import { pool } from "../../db.ts";
import { validate } from "../../middlewares/validate.ts";
import { IngredientRepository } from "../../repositories/ingredientRepository.ts";
import {
  createIngredientSchema,
  getIngredientsQuerySchema,
  ingredientIdParamSchema,
  patchIngredientSchema,
} from "../../schemas/ingredientSchema.ts";
import { IngredientService } from "../../services/ingredientService.ts";

const ingredientRepository = new IngredientRepository(pool);
const ingredientService = new IngredientService(ingredientRepository);
const ingredientController = new IngredientController(ingredientService);

const router = Router();

// Quand l'auth sera en place, POST / PATCH / DELETE recevront un middleware de
// rôle, à insérer entre le validate(...) et le contrôleur.

// Route racine de l'API ingredients : récupère tous les ingrédients
router.get(
  "/",
  validate(getIngredientsQuerySchema, "query"),
  ingredientController.getAll,
);

// Route pour récupérer un ingrédient par son id
router.get(
  "/:id",
  validate(ingredientIdParamSchema, "params"),
  ingredientController.getOneById,
);

// Route pour supprimer un ingrédient par son id.
// Le ON DELETE CASCADE sur beer_ingredient s'occupe de désassocier les bières.
router.delete(
  "/:id",
  validate(ingredientIdParamSchema, "params"),
  ingredientController.deleteOneById,
);

// Route pour ajouter un ingrédient
router.post(
  "/",
  validate(createIngredientSchema, "body"),
  ingredientController.addOne,
);

// Route pour modifier partiellement un ingrédient par son id
router.patch(
  "/:id",
  validate(ingredientIdParamSchema, "params"),
  validate(patchIngredientSchema, "body"),
  ingredientController.updateOneById,
);

export default router;
