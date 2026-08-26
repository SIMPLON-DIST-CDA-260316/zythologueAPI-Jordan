import type { Request, Response } from "express";
import type {
  BeerIdParam,
  CreateBeerInput,
  GetBeersQuery,
  PatchBeerInput,
} from "../schemas/beerSchema.ts";
import type { BeerService } from "../services/beerService.ts";

export class BeerController {
  private readonly beerService: BeerService;

  constructor(beerService: BeerService) {
    this.beerService = beerService;
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.query as GetBeersQuery;
    try {
      const result = await this.beerService.getAll(query);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  getOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
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

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
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

  addOne = async (_req: Request, res: Response): Promise<void> => {
    const body = res.locals.body as CreateBeerInput;
    try {
      const addedBeer = await this.beerService.addOne(body);
      if (addedBeer === "BREWERY_NOT_FOUND") {
        res.status(200).json({ message: `Brasserie non trouvée` });
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

  updateOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
    const body = res.locals.body as PatchBeerInput;

    try {
      const updatedBeer = await this.beerService.updateOneById(beerId, body);
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
