import type { Pool } from "pg";
import { BeerLog, type BeerLogRow } from "../models/beerLog.ts";

export class BeerLogRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(filters: {
    beerId?: number;
    order: "asc" | "desc";
    page: number;
    limit: number;
  }): Promise<{ logs: BeerLog[]; total: number }> {
    const direction = filters.order === "asc" ? "ASC" : "DESC";
    const offset = (filters.page - 1) * filters.limit;

    const result = await this.pool.query<BeerLogRow & { total: string }>(
      `SELECT id, beer_id, beer_name, action, logged_at, logged_by, COUNT(*) OVER() AS total
       FROM beer_log
       WHERE ($1::int IS NULL OR beer_id = $1)
       ORDER BY logged_at ${direction}
       LIMIT $2 OFFSET $3`,
      [filters.beerId ?? null, filters.limit, offset],
    );

    const total = result.rows[0] ? Number(result.rows[0].total) : 0;
    return { logs: result.rows.map(BeerLog.fromRow), total };
  }
}
