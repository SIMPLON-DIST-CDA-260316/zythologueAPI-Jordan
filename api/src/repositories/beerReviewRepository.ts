import { DatabaseError, type Pool } from "pg";
import { ConflictError } from "../errors/httpError.ts";
import { BeerReview, type BeerReviewRow } from "../models/beerReview.ts";

const REVIEW_COLUMNS = `id, grade, comment, created_at, user_id, beer_id`;

export class BeerReviewRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAllByBeerId(beerId: number): Promise<BeerReview[]> {
    const result = await this.pool.query<BeerReviewRow>(
      `SELECT ${REVIEW_COLUMNS} FROM beer_review WHERE beer_id = $1 ORDER BY created_at, id`,
      [beerId],
    );
    return result.rows.map(BeerReview.fromRow);
  }

  // beer_id dans le WHERE : un avis n'est accessible que via la bière qu'il note
  async findOneById(
    reviewId: number,
    beerId: number,
  ): Promise<BeerReview | null> {
    const result = await this.pool.query<BeerReviewRow>(
      `SELECT ${REVIEW_COLUMNS} FROM beer_review WHERE id = $1 AND beer_id = $2`,
      [reviewId, beerId],
    );
    const row = result.rows[0];
    return row ? BeerReview.fromRow(row) : null;
  }

  async addOne(
    beerId: number,
    userId: number,
    fields: { grade: number; comment: string | null },
  ): Promise<BeerReview> {
    try {
      const result = await this.pool.query<BeerReviewRow>(
        `INSERT INTO beer_review (grade, comment, user_id, beer_id)
         VALUES ($1, $2, $3, $4)
         RETURNING ${REVIEW_COLUMNS}`,
        [fields.grade, fields.comment, userId, beerId],
      );
      return BeerReview.fromRow(result.rows[0]);
    } catch (error) {
      // Contrainte UNIQUE (user_id, beer_id) : un seul avis par personne et par bière
      if (error instanceof DatabaseError && error.code === "23505") {
        throw new ConflictError(
          "Vous avez déjà donné votre avis sur cette bière",
        );
      }
      throw error;
    }
  }

  async updateOneById(
    reviewId: number,
    fields: { grade: number; comment: string | null },
  ): Promise<BeerReview> {
    const result = await this.pool.query<BeerReviewRow>(
      `UPDATE beer_review SET grade = $1, comment = $2 WHERE id = $3 RETURNING ${REVIEW_COLUMNS}`,
      [fields.grade, fields.comment, reviewId],
    );
    return BeerReview.fromRow(result.rows[0]);
  }

  async deleteOneById(reviewId: number): Promise<void> {
    await this.pool.query(`DELETE FROM beer_review WHERE id = $1`, [reviewId]);
  }

  async beerExists(beerId: number): Promise<boolean> {
    const beer = await this.pool.query(`SELECT id FROM beer WHERE id = $1`, [
      beerId,
    ]);
    return beer.rows.length > 0;
  }
}
