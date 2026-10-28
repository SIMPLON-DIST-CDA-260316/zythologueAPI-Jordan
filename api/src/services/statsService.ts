import type { Stats } from "../models/stats.ts";
import type { StatsRepository } from "../repositories/statsRepository.ts";

export class StatsService {
  private readonly statsRepository: StatsRepository;

  constructor(statsRepository: StatsRepository) {
    this.statsRepository = statsRepository;
  }

  async getStats(): Promise<Stats> {
    return this.statsRepository.getStats();
  }
}
