import type { Request, Response } from "express";
import type { BeerService } from "../services/beerService.ts";

export class BeerController {
  private readonly beerService: BeerService;

  constructor(beerService: BeerService) {
    this.beerService = beerService;
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const beers = await this.beerService.getAll();
    res.json(beers);
  };
}
