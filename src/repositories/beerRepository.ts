import type { Pool } from "pg";
import { Beer, type BeerRow } from "../models/beer.ts";
import type { CreateBeerInput } from "../schemas/beerSchema.ts";

export class BeerRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(filters: {
    breweryId?: number;
    categoryId?: number;
    ingredientId?: number;
    isAlcoholFree?: boolean;
    sortBy?: "price" | "alcoholLevel";
    order: "asc" | "desc";
    page: number;
    limit: number;
  }): Promise<{ beers: Beer[]; total: number }> {
    const sortColumn =
      filters.sortBy === "price"
        ? "be.price"
        : filters.sortBy === "alcoholLevel"
          ? "be.alcohol_level"
          : "be.id";
    const direction = filters.order === "desc" ? "DESC" : "ASC";
    const offset = (filters.page - 1) * filters.limit;

    // categoryId/ingredientId passent par une sous-requête IN plutôt qu'un
    // JOIN direct : évite de doublonner les lignes beer (une bière peut avoir
    // plusieurs catégories/ingrédients), sans avoir besoin de GROUP BY ici.
    const result = await this.pool.query<BeerRow & { total: string }>(
      `SELECT be.id, be.name, be.description, be.price, be.alcohol_level, be.is_alcohol_free,
              br.name AS "breweryName", be.brewery_id AS "breweryId", COUNT(*) OVER() AS total
       FROM beer AS be JOIN brewery AS br ON be.brewery_id = br.id
       WHERE ($1::int IS NULL OR be.brewery_id = $1)
         AND ($2::boolean IS NULL OR be.is_alcohol_free = $2)
         AND ($5::int IS NULL OR be.id IN (SELECT beer_id FROM beer_category WHERE category_id = $5))
         AND ($6::int IS NULL OR be.id IN (SELECT beer_id FROM beer_ingredient WHERE ingredient_id = $6))
       ORDER BY ${sortColumn} ${direction}
       LIMIT $3 OFFSET $4`,
      [
        filters.breweryId ?? null,
        filters.isAlcoholFree ?? null,
        filters.limit,
        offset,
        filters.categoryId ?? null,
        filters.ingredientId ?? null,
      ],
    );

    const total = result.rows[0] ? Number(result.rows[0].total) : 0;
    return { beers: result.rows.map(Beer.fromRow), total };
  }

  async findOneById(beerId: number): Promise<Beer | null> {
    // LEFT JOIN doublé (categories × ingredients) : DISTINCT dans json_agg
    // neutralise le produit croisé, COALESCE renvoie [] plutôt que [null]
    // pour une bière sans catégorie/ingrédient. GROUP BY be.id, br.id suffit
    // (dépendance fonctionnelle sur les clés primaires) pour sélectionner
    // librement be.* et br.name.
    const result = await this.pool.query<BeerRow>(
      `SELECT be.id, be.name, be.description, be.price, be.alcohol_level, be.is_alcohol_free,
              br.name AS "breweryName", be.brewery_id AS "breweryId",
              COALESCE(json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name))
                FILTER (WHERE c.id IS NOT NULL), '[]') AS categories,
              COALESCE(json_agg(DISTINCT jsonb_build_object('id', i.id, 'name', i.name))
                FILTER (WHERE i.id IS NOT NULL), '[]') AS ingredients
       FROM beer AS be
         JOIN brewery AS br ON be.brewery_id = br.id
         LEFT JOIN beer_category AS bc ON bc.beer_id = be.id
         LEFT JOIN category AS c ON c.id = bc.category_id
         LEFT JOIN beer_ingredient AS bi ON bi.beer_id = be.id
         LEFT JOIN ingredient AS i ON i.id = bi.ingredient_id
       WHERE be.id = $1
       GROUP BY be.id, br.id`,
      [beerId],
    );
    const row = result.rows[0];
    return row ? Beer.fromRow(row) : null;
  }

  async deleteOneById(beerId: number): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM beer WHERE id = $1`, [
      beerId,
    ]);
    return (result.rowCount ?? 0) > 0;
  }

  async breweryExists(breweryId: number): Promise<boolean> {
    const brewery = await this.pool.query(
      `SELECT id FROM brewery WHERE id = $1`,
      [breweryId],
    );
    return brewery.rows.length > 0;
  }

  async beerNameExists(beerName: string, excludeId?: number): Promise<boolean> {
    const beer = excludeId !== undefined
      ? await this.pool.query(
          `SELECT id FROM beer WHERE name = $1 AND id <> $2`,
          [beerName, excludeId],
        )
      : await this.pool.query(`SELECT id FROM beer WHERE name = $1`, [
          beerName,
        ]);
    return beer.rows.length > 0;
  }

  async addOne(beerInput: CreateBeerInput): Promise<Beer> {
    const newBeer = await this.pool.query<{ id: number }>(
      `INSERT INTO beer (name, description, price, alcohol_level, is_alcohol_free, brewery_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        beerInput.name,
        beerInput.description,
        beerInput.price,
        beerInput.alcoholLevel,
        beerInput.isAlcoholFree,
        beerInput.breweryId,
      ],
    );
    const addedBeer = await this.findOneById(newBeer.rows[0].id);
    if (!addedBeer) {
      throw new Error("Erreur lors de la création de la bière");
    }
    return addedBeer;
  }

  async updateOneById(
    beerId: number,
    fields: {
      name: string;
      description: string | null;
      price: number;
      alcoholLevel: number;
      isAlcoholFree: boolean;
      breweryId: number;
    },
  ): Promise<Beer | null> {
    await this.pool.query(
      `UPDATE beer
       SET name = $1, description = $2, price = $3, alcohol_level = $4, is_alcohol_free = $5, brewery_id = $6
       WHERE id = $7`,
      [
        fields.name,
        fields.description,
        fields.price,
        fields.alcoholLevel,
        fields.isAlcoholFree,
        fields.breweryId,
        beerId,
      ],
    );
    return this.findOneById(beerId);
  }
}
