import type { Request, Response } from "express";
import type { StatsService } from "../services/statsService.ts";

export class StatsController {
  private readonly statsService: StatsService;

  constructor(statsService: StatsService) {
    this.statsService = statsService;
  }

  getStats = async (_req: Request, res: Response): Promise<void> => {
    const stats = await this.statsService.getStats();
    res.status(200).json(stats);
  };
}
