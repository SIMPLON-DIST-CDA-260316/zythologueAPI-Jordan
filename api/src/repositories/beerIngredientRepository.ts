import type { Pool } from "pg";

export class BeerIngredientRepository {
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
    ingredientId: number,
  ): Promise<boolean> {
    const association = await this.pool.query(
      `SELECT 1 FROM beer_ingredient WHERE beer_id = $1 AND ingredient_id = $2`,
      [beerId, ingredientId],
    );
    return association.rows.length > 0;
  }

  async addOne(beerId: number, ingredientId: number): Promise<void> {
    await this.pool.query(
      `INSERT INTO beer_ingredient (beer_id, ingredient_id) VALUES ($1, $2)`,
      [beerId, ingredientId],
    );
  }

  async deleteOneById(
    beerId: number,
    ingredientId: number,
  ): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM beer_ingredient WHERE beer_id = $1 AND ingredient_id = $2`,
      [beerId, ingredientId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
