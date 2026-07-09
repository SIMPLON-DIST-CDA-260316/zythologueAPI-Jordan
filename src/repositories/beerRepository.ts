import type { Pool } from "pg";
import { Beer, type BeerRow } from "../models/beer.ts";

export class BeerRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(): Promise<Beer[]> {
    const result = await this.pool.query<BeerRow>(
      `SELECT be.id, be.name, be.description, be.price, be.alcohol_level, be.is_alcohol_free, br.name AS "breweryName"
       FROM beer AS be JOIN brewery AS br ON be.brewery_id = br.id
       ORDER BY id`,
    );

    return result.rows.map(Beer.fromRow);
  }

  async findOneById(beerId: number): Promise<Beer | null> {
    const result = await this.pool.query<BeerRow>(
      `SELECT be.id, be.name, be.description, be.price, be.alcohol_level, be.is_alcohol_free, br.name AS "breweryName"
       FROM beer AS be JOIN brewery AS br ON be.brewery_id = br.id WHERE be.id = $1`,
      [beerId],
    );
    const row = result.rows[0];
    return row ? Beer.fromRow(row) : null;
  }
}
