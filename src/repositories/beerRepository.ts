import type { Pool } from "pg";
import { Beer, type BeerRow } from "../models/beer.ts";
import type { CreateBeerInput } from "../schemas/beerSchema.ts";

export class BeerRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(): Promise<Beer[]> {
    const result = await this.pool.query<BeerRow>(
      `SELECT be.id, be.name, be.description, be.price, be.alcohol_level, be.is_alcohol_free, br.name AS "breweryName", be.brewery_id AS "breweryId"
       FROM beer AS be JOIN brewery AS br ON be.brewery_id = br.id
       ORDER BY id`,
    );

    return result.rows.map(Beer.fromRow);
  }

  async findOneById(beerId: number): Promise<Beer | null> {
    const result = await this.pool.query<BeerRow>(
      `SELECT be.id, be.name, be.description, be.price, be.alcohol_level, be.is_alcohol_free, br.name AS "breweryName", be.brewery_id AS "breweryId"
       FROM beer AS be JOIN brewery AS br ON be.brewery_id = br.id WHERE be.id = $1`,
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
