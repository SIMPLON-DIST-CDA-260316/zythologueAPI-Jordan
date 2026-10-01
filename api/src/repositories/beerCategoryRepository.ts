import type { Pool } from "pg";

export class BeerCategoryRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async beerExists(beerId: number): Promise<boolean> {
    const beer = await this.pool.query(`SELECT id FROM beer WHERE id = $1`, [
      beerId,
    ]);
    return beer.rows.length > 0;
  }

  async associationExists(
    beerId: number,
    categoryId: number,
  ): Promise<boolean> {
    const association = await this.pool.query(
      `SELECT 1 FROM beer_category WHERE beer_id = $1 AND category_id = $2`,
      [beerId, categoryId],
    );
    return association.rows.length > 0;
  }

  async addOne(beerId: number, categoryId: number): Promise<void> {
    await this.pool.query(
      `INSERT INTO beer_category (beer_id, category_id) VALUES ($1, $2)`,
      [beerId, categoryId],
    );
  }

  async deleteOneById(beerId: number, categoryId: number): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM beer_category WHERE beer_id = $1 AND category_id = $2`,
      [beerId, categoryId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
