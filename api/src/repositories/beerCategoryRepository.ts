import { DatabaseError, type Pool } from "pg";
import { ConflictError } from "../errors/httpError.ts";

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

  async addOne(beerId: number, categoryId: number): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO beer_category (beer_id, category_id) VALUES ($1, $2)`,
        [beerId, categoryId],
      );
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new ConflictError("Cette catégorie est déjà associée à cette bière");
      }
      throw error;
    }
  }

  async deleteOneById(beerId: number, categoryId: number): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM beer_category WHERE beer_id = $1 AND category_id = $2`,
      [beerId, categoryId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
