import type { Request, Response } from "express";
import { BadRequestError } from "../errors/httpError.ts";
import type { BreweryPhotoParams } from "../schemas/breweryPhotoSchema.ts";
import type { BreweryIdParam } from "../schemas/brewerySchema.ts";
import type { BreweryPhotoService } from "../services/breweryPhotoService.ts";

export class BreweryPhotoController {
  private readonly breweryPhotoService: BreweryPhotoService;

  constructor(breweryPhotoService: BreweryPhotoService) {
    this.breweryPhotoService = breweryPhotoService;
  }

  getAllByBreweryId = async (_req: Request, res: Response): Promise<void> => {
    const { id: breweryId } = res.locals.params as BreweryIdParam;
    const photos =
      await this.breweryPhotoService.getAllByBreweryId(breweryId);
    res.status(200).json(photos);
  };

  addOne = async (req: Request, res: Response): Promise<void> => {
    const { id: breweryId } = res.locals.params as BreweryIdParam;
    // req.file vient de Multer : c'est la seule donnée qui ne transite pas par
    // res.locals. Le middleware uploadPhoto garantit sa présence.
    const file = req.file;
    if (!file) {
      throw new BadRequestError(
        "Aucun fichier reçu (champ attendu : « photo »)",
      );
    }

    const photo = await this.breweryPhotoService.addOne(
      breweryId,
      file.buffer,
    );
    res.status(201).json(photo);
  };

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: breweryId, photoId } = res.locals
      .params as BreweryPhotoParams;
    await this.breweryPhotoService.deleteOneById(breweryId, photoId);
    res.status(204).send();
  };
}
