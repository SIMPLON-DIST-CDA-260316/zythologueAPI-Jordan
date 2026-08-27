import type { Request, Response } from "express";
import type {
  BreweryIdParam,
  BreweryPhotoParams,
} from "../schemas/breweryPhotoSchema.ts";
import type { BreweryPhotoService } from "../services/breweryPhotoService.ts";

export class BreweryPhotoController {
  private readonly breweryPhotoService: BreweryPhotoService;

  constructor(breweryPhotoService: BreweryPhotoService) {
    this.breweryPhotoService = breweryPhotoService;
  }

  getAllByBreweryId = async (_req: Request, res: Response): Promise<void> => {
    const { id: breweryId } = res.locals.params as BreweryIdParam;
    try {
      const photos =
        await this.breweryPhotoService.getAllByBreweryId(breweryId);
      if (photos === "BREWERY_NOT_FOUND") {
        res.status(404).json({ message: `Brasserie non trouvée` });
        return;
      }
      res.status(200).json(photos);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  addOne = async (req: Request, res: Response): Promise<void> => {
    const { id: breweryId } = res.locals.params as BreweryIdParam;
    // req.file vient de Multer : c'est la seule donnée qui ne transite pas par
    // res.locals. Le middleware uploadPhoto garantit sa présence.
    const file = req.file;
    if (!file) {
      res
        .status(400)
        .json({ message: "Aucun fichier reçu (champ attendu : « photo »)" });
      return;
    }

    try {
      const photo = await this.breweryPhotoService.addOne(
        breweryId,
        file.buffer,
      );
      switch (photo) {
        case "BREWERY_NOT_FOUND":
          res.status(404).json({ message: `Brasserie non trouvée` });
          return;
        case "PHOTO_LIMIT_REACHED":
          res.status(409).json({
            message: `Cette brasserie a déjà le nombre maximum de photos`,
          });
          return;
        case "NOT_AN_IMAGE":
          res
            .status(400)
            .json({ message: `Le fichier envoyé n'est pas une image valide` });
          return;
        case "UNSUPPORTED_FORMAT":
          res.status(415).json({
            message: `Format d'image non supporté (JPEG, PNG, WebP ou AVIF attendu)`,
          });
          return;
        case "IMAGE_TOO_SMALL":
          res
            .status(400)
            .json({ message: `Image trop petite (100 x 100 px minimum)` });
          return;
        case "IMAGE_TOO_LARGE":
          res
            .status(400)
            .json({ message: `Image trop grande (10 000 x 10 000 px maximum)` });
          return;
        default:
          res.status(201).json(photo);
      }
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: breweryId, photoId } = res.locals
      .params as BreweryPhotoParams;
    try {
      const deleted = await this.breweryPhotoService.deleteOneById(
        breweryId,
        photoId,
      );
      if (deleted === "PHOTO_NOT_FOUND") {
        res.status(404).json({ message: `Photo non trouvée` });
        return;
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };
}
