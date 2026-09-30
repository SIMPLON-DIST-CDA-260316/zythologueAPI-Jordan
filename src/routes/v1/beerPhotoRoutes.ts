import { Router } from "express";
import { BeerPhotoController } from "../../controllers/beerPhotoController.ts";
import { pool } from "../../db.ts";
import { requireAdmin } from "../../middlewares/auth.ts";
import { uploadPhoto } from "../../middlewares/upload.ts";
import { validate } from "../../middlewares/validate.ts";
import { BeerPhotoRepository } from "../../repositories/beerPhotoRepository.ts";
import { beerPhotoParamsSchema } from "../../schemas/beerPhotoSchema.ts";
import { beerIdParamSchema } from "../../schemas/beerSchema.ts";
import { BeerPhotoService } from "../../services/beerPhotoService.ts";

const beerPhotoRepository = new BeerPhotoRepository(pool);
const beerPhotoService = new BeerPhotoService(beerPhotoRepository);
const beerPhotoController = new BeerPhotoController(beerPhotoService);

// mergeParams : indispensable, :id est déclaré par le routeur parent (beerRoutes).
const router = Router({ mergeParams: true });

// Route pour lister les photos d'une bière
router.get(
  "/",
  validate(beerIdParamSchema, "params"),
  beerPhotoController.getAllByBeerId,
);

// Route pour uploader une photo de bière.
// L'ordre est un choix de sécurité : requireAdmin, puis validate, puis
// uploadPhoto. Un anonyme, un client ou un :id malformé sont rejetés avant
// d'avoir bufferisé 5 Mo en mémoire.
router.post(
  "/",
  requireAdmin,
  validate(beerIdParamSchema, "params"),
  uploadPhoto,
  beerPhotoController.addOne,
);

// Route pour supprimer une photo de bière
router.delete(
  "/:photoId",
  requireAdmin,
  validate(beerPhotoParamsSchema, "params"),
  beerPhotoController.deleteOneById,
);

export default router;
