import { Router } from "express";
import { BeerController } from "../../controllers/beerController.ts";
import { pool } from "../../db.ts";
import { validate } from "../../middlewares/validate.ts";
import { BeerRepository } from "../../repositories/beerRepository.ts";
import {
  beerIdParamSchema,
  createBeerSchema,
  getBeersQuerySchema,
  patchBeerSchema,
} from "../../schemas/beerSchema.ts";
import { BeerService } from "../../services/beerService.ts";

const beerRepository = new BeerRepository(pool);
const beerService = new BeerService(beerRepository);
const beerController = new BeerController(beerService);

const router = Router();

// Route racine de l'API beers : récupère toutes les bières
router.get("/", validate(getBeersQuerySchema, "query"), beerController.getAll);

// Route pour récupérer une bière par son id
router.get(
  "/:id",
  validate(beerIdParamSchema, "params"),
  beerController.getOneById,
);

// Route pour supprimer une bière par son id
router.delete(
  "/:id",
  validate(beerIdParamSchema, "params"),
  beerController.deleteOneById,
);

// Route pour ajouter une bière
router.post("/", validate(createBeerSchema, "body"), beerController.addOne);

// Route pour modifier partiellement une bière par son id
router.patch(
  "/:id",
  validate(beerIdParamSchema, "params"),
  validate(patchBeerSchema, "body"),
  beerController.updateOneById,
);

export default router;
