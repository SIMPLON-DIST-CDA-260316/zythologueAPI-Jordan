import { Router } from "express";
import { BreweryController } from "../../controllers/breweryController.ts";
import { pool } from "../../db.ts";
import { validate } from "../../middlewares/validate.ts";
import { BreweryRepository } from "../../repositories/breweryRepository.ts";
import {
  breweryIdParamSchema,
  createBrewerySchema,
  getBreweriesQuerySchema,
  patchBrewerySchema,
} from "../../schemas/brewerySchema.ts";
import { BreweryService } from "../../services/breweryService.ts";
import breweryPhotoRoutes from "./breweryPhotoRoutes.ts";

const breweryRepository = new BreweryRepository(pool);
const breweryService = new BreweryService(breweryRepository);
const breweryController = new BreweryController(breweryService);

const router = Router();

// Quand l'auth sera en place, POST / PATCH / DELETE recevront un middleware de
// rôle, à insérer entre le validate(...) et le contrôleur.

// Route racine de l'API breweries : récupère toutes les brasseries
router.get(
  "/",
  validate(getBreweriesQuerySchema, "query"),
  breweryController.getAll,
);

// Route pour récupérer une brasserie par son id
router.get(
  "/:id",
  validate(breweryIdParamSchema, "params"),
  breweryController.getOneById,
);

// Route pour supprimer une brasserie par son id.
// Attention : la cascade SQL emporte aussi ses bières, photos, avis et favoris.
router.delete(
  "/:id",
  validate(breweryIdParamSchema, "params"),
  breweryController.deleteOneById,
);

// Route pour ajouter une brasserie
router.post(
  "/",
  validate(createBrewerySchema, "body"),
  breweryController.addOne,
);

// Route pour modifier partiellement une brasserie par son id
router.patch(
  "/:id",
  validate(breweryIdParamSchema, "params"),
  validate(patchBrewerySchema, "body"),
  breweryController.updateOneById,
);

// Sous-ressource : photos d'une brasserie
router.use("/:id/photos", breweryPhotoRoutes);

export default router;
