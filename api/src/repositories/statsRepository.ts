import type { Pool } from "pg";
import type { Stats } from "../models/stats.ts";

export class StatsRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // ::int et ::float8 : pg renvoie COUNT (bigint) et AVG (numeric) en string
  async getStats(): Promise<Stats> {
    const [totals, byCategory, byAlcoholLevel, topRated] = await Promise.all([
      this.pool.query<{
        beers: number;
        breweries: number;
        reviews: number;
        average_grade: number | null;
      }>(
        `SELECT (SELECT COUNT(*) FROM beer)::int AS beers,
                (SELECT COUNT(*) FROM brewery)::int AS breweries,
                (SELECT COUNT(*) FROM beer_review)::int AS reviews,
                (SELECT ROUND(AVG(grade), 1) FROM beer_review)::float8 AS average_grade`,
      ),
      // LEFT JOIN : une catégorie sans bière apparaît avec 0
      this.pool.query<{ name: string; count: number }>(
        `SELECT c.name, COUNT(bc.beer_id)::int AS count
         FROM category c
         LEFT JOIN beer_category bc ON bc.category_id = c.id
         GROUP BY c.id, c.name
         ORDER BY count DESC, c.name`,
      ),
      // Tranches fixes, toutes renvoyées dans l'ordre même vides
      this.pool.query<{ range: string; count: number }>(
        `SELECT r.label AS range, COUNT(b.id)::int AS count
         FROM (VALUES (0, 'Sans alcool'), (1, '< 5 %'), (2, '5–7 %'), (3, '7–9 %'), (4, '≥ 9 %'))
           AS r(bucket, label)
         LEFT JOIN beer b ON r.bucket = CASE
           WHEN b.is_alcohol_free THEN 0
           WHEN b.alcohol_level < 5 THEN 1
           WHEN b.alcohol_level < 7 THEN 2
           WHEN b.alcohol_level < 9 THEN 3
           ELSE 4
         END
         GROUP BY r.bucket, r.label
         ORDER BY r.bucket`,
      ),
      this.pool.query<{
        id: number;
        name: string;
        average_grade: number;
        review_count: number;
      }>(
        `SELECT b.id, b.name,
                ROUND(AVG(r.grade), 1)::float8 AS average_grade,
                COUNT(*)::int AS review_count
         FROM beer b
         JOIN beer_review r ON r.beer_id = b.id
         GROUP BY b.id, b.name
         ORDER BY AVG(r.grade) DESC, COUNT(*) DESC, b.name
         LIMIT 5`,
      ),
    ]);

    const { beers, breweries, reviews, average_grade } = totals.rows[0];
    return {
      totals: { beers, breweries, reviews, averageGrade: average_grade },
      beersByCategory: byCategory.rows,
      beersByAlcoholLevel: byAlcoholLevel.rows,
      topRatedBeers: topRated.rows.map((row) => ({
        id: row.id,
        name: row.name,
        averageGrade: row.average_grade,
        reviewCount: row.review_count,
      })),
    };
  }
}
