import type { Request, Response } from "express";
import type { BeerIdParam } from "../schemas/beerSchema.ts";
import type { BeerPhotoParams } from "../schemas/beerPhotoSchema.ts";
import type { BeerPhotoService } from "../services/beerPhotoService.ts";

export class BeerPhotoController {
  private readonly beerPhotoService: BeerPhotoService;

  constructor(beerPhotoService: BeerPhotoService) {
    this.beerPhotoService = beerPhotoService;
  }

  getAllByBeerId = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
    try {
      const photos = await this.beerPhotoService.getAllByBeerId(beerId);
      if (photos === "BEER_NOT_FOUND") {
        res.status(404).json({ message: `Bière non trouvée` });
        return;
      }
      res.status(200).json(photos);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  addOne = async (req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
    // req.file vient de Multer : c'est la seule donnée qui ne transite pas par
    // res.locals. Le middleware uploadBeerPhoto garantit sa présence.
    const file = req.file;
    if (!file) {
      res
        .status(400)
        .json({ message: "Aucun fichier reçu (champ attendu : « photo »)" });
      return;
    }

    try {
      const photo = await this.beerPhotoService.addOne(beerId, file.buffer);
      switch (photo) {
        case "BEER_NOT_FOUND":
          res.status(404).json({ message: `Bière non trouvée` });
          return;
        case "PHOTO_LIMIT_REACHED":
          res
            .status(409)
            .json({ message: `Cette bière a déjà le nombre maximum de photos` });
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
    const { id: beerId, photoId } = res.locals.params as BeerPhotoParams;
    try {
      const deleted = await this.beerPhotoService.deleteOneById(beerId, photoId);
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
