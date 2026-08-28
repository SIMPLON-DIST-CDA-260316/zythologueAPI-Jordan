import type { Request, Response } from "express";
import { BadRequestError } from "../errors/httpError.ts";
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
    const photos = await this.beerPhotoService.getAllByBeerId(beerId);
    res.status(200).json(photos);
  };

  addOne = async (req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
    // req.file vient de Multer : c'est la seule donnée qui ne transite pas par
    // res.locals. Le middleware uploadBeerPhoto garantit sa présence.
    const file = req.file;
    if (!file) {
      throw new BadRequestError(
        "Aucun fichier reçu (champ attendu : « photo »)",
      );
    }

    const photo = await this.beerPhotoService.addOne(beerId, file.buffer);
    res.status(201).json(photo);
  };

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId, photoId } = res.locals.params as BeerPhotoParams;
    await this.beerPhotoService.deleteOneById(beerId, photoId);
    res.status(204).send();
  };
}
