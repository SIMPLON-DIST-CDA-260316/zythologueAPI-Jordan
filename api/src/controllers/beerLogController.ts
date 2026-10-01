import type { Request, Response } from "express";
import { getBeerLogsQuerySchema } from "../schemas/beerLogSchema.ts";
import type { BeerLogService } from "../services/beerLogService.ts";

export class BeerLogController {
  private readonly beerLogService: BeerLogService;

  constructor(beerLogService: BeerLogService) {
    this.beerLogService = beerLogService;
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    const parsed = getBeerLogsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        message: "Paramètres de requête invalides",
        errors: parsed.error.flatten(),
      });
      return;
    }
    try {
      const result = await this.beerLogService.getAll(parsed.data);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };
}
