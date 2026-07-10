import type { Request, Response } from "express";
import { createBeerSchema, patchBeerSchema } from "../schemas/beerSchema.ts";
import type { BeerService } from "../services/beerService.ts";

export class BeerController {
  private readonly beerService: BeerService;

  constructor(beerService: BeerService) {
    this.beerService = beerService;
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const beers = await this.beerService.getAll();
      res.status(200).json(beers);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  getOneById = async (req: Request, res: Response): Promise<void> => {
    const beerId = Number(req.params.id);
    if (isNaN(beerId) || !Number.isInteger(beerId) || beerId <= 0) {
      res.status(400).json({ message: `L'identifiant n'est pas conforme` });
      return;
    }
    try {
      const beer = await this.beerService.getOneById(beerId);
      if (!beer) {
        res.status(404).json({ message: `Bière non trouvée` });
        return;
      }
      res.status(200).json(beer);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  deleteOneById = async (req: Request, res: Response): Promise<void> => {
    const beerId = Number(req.params.id);
    if (isNaN(beerId) || !Number.isInteger(beerId) || beerId <= 0) {
      res.status(400).json({ message: `L'identifiant n'est pas conforme` });
      return;
    }
    try {
      const deletedBeer = await this.beerService.deleteOneById(beerId);
      if (!deletedBeer) {
        res.status(404).json({ message: `Bière non trouvée` });
        return;
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  addOne = async (req: Request, res: Response): Promise<void> => {
    const parsed = createBeerSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Données invalides", errors: parsed.error.flatten() });
      return;
    }
    try {
      const addedBeer = await this.beerService.addOne(parsed.data);
      if (addedBeer === "BREWERY_NOT_FOUND") {
        res.status(404).json({ message: `Brasserie non trouvée` });
        return;
      }
      if (addedBeer === "NAME_ALREADY_EXISTS") {
        res.status(409).json({ message: `Une bière de ce nom existe déjà` });
        return;
      }
      res.status(201).json(addedBeer);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  updateOneById = async (req: Request, res: Response): Promise<void> => {
    const beerId = Number(req.params.id);
    if (isNaN(beerId) || !Number.isInteger(beerId) || beerId <= 0) {
      res.status(400).json({ message: `L'identifiant n'est pas conforme` });
      return;
    }

    const parsed = patchBeerSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Données invalides", errors: parsed.error.flatten() });
      return;
    }

    try {
      const updatedBeer = await this.beerService.updateOneById(
        beerId,
        parsed.data,
      );
      switch (updatedBeer) {
        case "BEER_NOT_FOUND":
          res.status(404).json({ message: `Bière non trouvée` });
          return;
        case "BREWERY_NOT_FOUND":
          res.status(404).json({ message: `Brasserie non trouvée` });
          return;
        case "NAME_ALREADY_EXISTS":
          res.status(409).json({ message: `Une bière de ce nom existe déjà` });
          return;
        case "INVALID_ALCOHOL_COHERENCE":
          res.status(400).json({
            message:
              "isAlcoholFree doit correspondre au taux d'alcool (sans alcool si < 0.5%, avec alcool sinon)",
          });
          return;
        default:
          res.status(200).json(updatedBeer);
      }
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };
}
