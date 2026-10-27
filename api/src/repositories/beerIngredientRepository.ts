import { DatabaseError, type Pool } from "pg";
import { ConflictError } from "../errors/httpError.ts";

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

  async addOne(beerId: number, ingredientId: number): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO beer_ingredient (beer_id, ingredient_id) VALUES ($1, $2)`,
        [beerId, ingredientId],
      );
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new ConflictError("Cet ingrédient est déjà associé à cette bière");
      }
      throw error;
    }
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
