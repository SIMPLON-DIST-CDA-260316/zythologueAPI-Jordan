import type { Request, Response } from "express";
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
    if (isNaN(beerId) || beerId <= 0) {
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
    if (isNaN(beerId) || beerId <= 0) {
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
}
