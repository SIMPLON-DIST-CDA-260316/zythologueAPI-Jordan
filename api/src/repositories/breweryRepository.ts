import type { Pool } from "pg";
import { Brewery, type BreweryRow } from "../models/brewery.ts";
import type { CreateBreweryInput } from "../schemas/brewerySchema.ts";

// beerCount vient d'un LEFT JOIN agrégé : une brasserie sans bière reste dans
// le résultat, avec un compte à 0.
const BREWERY_SELECT = `br.id, br.name, br.description, br.country, br.city, br.website,
          COUNT(be.id) AS "beerCount"`;
const BREWERY_FROM = `FROM brewery AS br LEFT JOIN beer AS be ON be.brewery_id = br.id`;

export class BreweryRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(filters: {
    country?: string;
    city?: string;
    name?: string;
    sortBy?: "name";
    order: "asc" | "desc";
    page: number;
    limit: number;
  }): Promise<{ breweries: Brewery[]; total: number }> {
    const sortColumn = filters.sortBy === "name" ? "br.name" : "br.id";
    const direction = filters.order === "desc" ? "DESC" : "ASC";
    const offset = (filters.page - 1) * filters.limit;

    // COUNT(*) OVER() est évalué après le GROUP BY et avant le LIMIT : il compte
    // donc les brasseries filtrées, pas les lignes de la jointure.
    const result = await this.pool.query<BreweryRow & { total: string }>(
      `SELECT ${BREWERY_SELECT}, COUNT(*) OVER() AS total
       ${BREWERY_FROM}
       WHERE ($1::text IS NULL OR br.country = $1)
         AND ($2::text IS NULL OR br.city = $2)
         AND ($3::text IS NULL OR br.name ILIKE '%' || $3 || '%')
       GROUP BY br.id
       ORDER BY ${sortColumn} ${direction}
       LIMIT $4 OFFSET $5`,
      [
        filters.country ?? null,
        filters.city ?? null,
        filters.name ?? null,
        filters.limit,
        offset,
      ],
    );

    const total = result.rows[0] ? Number(result.rows[0].total) : 0;
    return { breweries: result.rows.map(Brewery.fromRow), total };
  }

  async findOneById(breweryId: number): Promise<Brewery | null> {
    const result = await this.pool.query<BreweryRow>(
      `SELECT ${BREWERY_SELECT} ${BREWERY_FROM} WHERE br.id = $1 GROUP BY br.id`,
      [breweryId],
    );
    const row = result.rows[0];
    return row ? Brewery.fromRow(row) : null;
  }

  async breweryNameExists(
    breweryName: string,
    excludeId?: number,
  ): Promise<boolean> {
    const brewery =
      excludeId !== undefined
        ? await this.pool.query(
            `SELECT id FROM brewery WHERE name = $1 AND id <> $2`,
            [breweryName, excludeId],
          )
        : await this.pool.query(`SELECT id FROM brewery WHERE name = $1`, [
            breweryName,
          ]);
    return brewery.rows.length > 0;
  }

  async addOne(breweryInput: CreateBreweryInput): Promise<Brewery> {
    const newBrewery = await this.pool.query<{ id: number }>(
      `INSERT INTO brewery (name, description, country, city, website) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        breweryInput.name,
        breweryInput.description,
        breweryInput.country,
        breweryInput.city,
        breweryInput.website ?? null,
      ],
    );
    const addedBrewery = await this.findOneById(newBrewery.rows[0].id);
    if (!addedBrewery) {
      throw new Error("Erreur lors de la création de la brasserie");
    }
    return addedBrewery;
  }

  async updateOneById(
    breweryId: number,
    fields: {
      name: string;
      description: string;
      country: string;
      city: string;
      website: string | null;
    },
  ): Promise<Brewery | null> {
    await this.pool.query(
      `UPDATE brewery
       SET name = $1, description = $2, country = $3, city = $4, website = $5
       WHERE id = $6`,
      [
        fields.name,
        fields.description,
        fields.country,
        fields.city,
        fields.website,
        breweryId,
      ],
    );
    return this.findOneById(breweryId);
  }

  /**
   * Les photos partent en cascade (brewery_photo directement, beer_photo via
   * beer) : leurs URLs doivent être lues AVANT le DELETE, sinon les fichiers
   * restent orphelins sur le disque.
   */
  async findPhotoUrlsByBreweryId(
    breweryId: number,
  ): Promise<{ url: string; thumbnailUrl: string | null }[]> {
    const result = await this.pool.query<{
      url: string;
      thumbnail_url: string | null;
    }>(
      `SELECT url, thumbnail_url FROM brewery_photo WHERE brewery_id = $1
       UNION ALL
       SELECT bp.url, bp.thumbnail_url FROM beer_photo AS bp
         JOIN beer AS be ON bp.beer_id = be.id
       WHERE be.brewery_id = $1`,
      [breweryId],
    );
    return result.rows.map((row) => ({
      url: row.url,
      thumbnailUrl: row.thumbnail_url,
    }));
  }

  async deleteOneById(breweryId: number): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM brewery WHERE id = $1`, [
      breweryId,
    ]);
    return (result.rowCount ?? 0) > 0;
  }
}
