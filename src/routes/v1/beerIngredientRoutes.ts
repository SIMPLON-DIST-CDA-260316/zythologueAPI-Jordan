import { Router } from "express";
import { BeerIngredientController } from "../../controllers/beerIngredientController.ts";
import { pool } from "../../db.ts";
import { validate } from "../../middlewares/validate.ts";
import { BeerIngredientRepository } from "../../repositories/beerIngredientRepository.ts";
import { IngredientRepository } from "../../repositories/ingredientRepository.ts";
import { beerIdParamSchema } from "../../schemas/beerSchema.ts";
import {
  beerIngredientParamsSchema,
  createBeerIngredientSchema,
} from "../../schemas/beerIngredientSchema.ts";
import { BeerIngredientService } from "../../services/beerIngredientService.ts";

const beerIngredientRepository = new BeerIngredientRepository(pool);
const ingredientRepository = new IngredientRepository(pool);
const beerIngredientService = new BeerIngredientService(
  beerIngredientRepository,
  ingredientRepository,
);
const beerIngredientController = new BeerIngredientController(
  beerIngredientService,
);

// mergeParams : indispensable, :id est déclaré par le routeur parent (beerRoutes).
const router = Router({ mergeParams: true });

// Quand l'auth sera en place, POST / DELETE recevront un middleware de rôle,
// à insérer entre le validate(...) et le contrôleur.

// Route pour associer un ingrédient à une bière
router.post(
  "/",
  validate(beerIdParamSchema, "params"),
  validate(createBeerIngredientSchema, "body"),
  beerIngredientController.addOne,
);

// Route pour dissocier un ingrédient d'une bière
router.delete(
  "/:ingredientId",
  validate(beerIngredientParamsSchema, "params"),
  beerIngredientController.deleteOneById,
);

export default router;
