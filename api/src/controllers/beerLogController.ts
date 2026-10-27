import type { Request, Response } from "express";
import type { GetBeerLogsQuery } from "../schemas/beerLogSchema.ts";
import type { BeerLogService } from "../services/beerLogService.ts";

export class BeerLogController {
  private readonly beerLogService: BeerLogService;

  constructor(beerLogService: BeerLogService) {
    this.beerLogService = beerLogService;
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.query as GetBeerLogsQuery;
    const result = await this.beerLogService.getAll(query);
    res.status(200).json(result);
  };
}
