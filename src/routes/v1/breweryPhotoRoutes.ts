import { Router } from "express";
import { BreweryPhotoController } from "../../controllers/breweryPhotoController.ts";
import { pool } from "../../db.ts";
import { uploadPhoto } from "../../middlewares/upload.ts";
import { validate } from "../../middlewares/validate.ts";
import { BreweryPhotoRepository } from "../../repositories/breweryPhotoRepository.ts";
import { breweryPhotoParamsSchema } from "../../schemas/breweryPhotoSchema.ts";
import { breweryIdParamSchema } from "../../schemas/brewerySchema.ts";
import { BreweryPhotoService } from "../../services/breweryPhotoService.ts";

const breweryPhotoRepository = new BreweryPhotoRepository(pool);
const breweryPhotoService = new BreweryPhotoService(breweryPhotoRepository);
const breweryPhotoController = new BreweryPhotoController(breweryPhotoService);

// mergeParams : indispensable, :id est déclaré par le routeur parent (breweryRoutes).
const router = Router({ mergeParams: true });

// Route pour lister les photos d'une brasserie
router.get(
  "/",
  validate(breweryIdParamSchema, "params"),
  breweryPhotoController.getAllByBreweryId,
);

// Route pour uploader une photo de brasserie.
// L'ordre est un choix de sécurité : validate AVANT uploadPhoto, pour qu'un
// :id malformé soit rejeté avant d'avoir bufferisé 5 Mo en mémoire.
router.post(
  "/",
  validate(breweryIdParamSchema, "params"),
  uploadPhoto,
  breweryPhotoController.addOne,
);

// Route pour supprimer une photo de brasserie
router.delete(
  "/:photoId",
  validate(breweryPhotoParamsSchema, "params"),
  breweryPhotoController.deleteOneById,
);

export default router;
