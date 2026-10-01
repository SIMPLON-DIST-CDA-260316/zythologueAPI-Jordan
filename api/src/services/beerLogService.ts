import type { BeerLog } from "../models/beerLog.ts";
import type { BeerLogRepository } from "../repositories/beerLogRepository.ts";
import type { GetBeerLogsQuery } from "../schemas/beerLogSchema.ts";

export class BeerLogService {
  private readonly beerLogRepository: BeerLogRepository;

  constructor(beerLogRepository: BeerLogRepository) {
    this.beerLogRepository = beerLogRepository;
  }

  async getAll(query: GetBeerLogsQuery): Promise<{
    data: BeerLog[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const { logs, total } = await this.beerLogRepository.findAll(query);
    return {
      data: logs,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
