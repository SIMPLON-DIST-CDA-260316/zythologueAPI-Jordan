import type { Pool } from "pg";
import { BeerPhoto, type BeerPhotoRow } from "../models/beerPhoto.ts";

const PHOTO_COLUMNS = `id, url, thumbnail_url, width, height, created_at, beer_id`;

export class BeerPhotoRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAllByBeerId(beerId: number): Promise<BeerPhoto[]> {
    const result = await this.pool.query<BeerPhotoRow>(
      `SELECT ${PHOTO_COLUMNS} FROM beer_photo WHERE beer_id = $1 ORDER BY created_at, id`,
      [beerId],
    );
    return result.rows.map(BeerPhoto.fromRow);
  }

  async findOneById(photoId: number): Promise<BeerPhoto | null> {
    const result = await this.pool.query<BeerPhotoRow>(
      `SELECT ${PHOTO_COLUMNS} FROM beer_photo WHERE id = $1`,
      [photoId],
    );
    const row = result.rows[0];
    return row ? BeerPhoto.fromRow(row) : null;
  }

  async countByBeerId(beerId: number): Promise<number> {
    const result = await this.pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM beer_photo WHERE beer_id = $1`,
      [beerId],
    );
    return Number(result.rows[0].count);
  }

  async addOne(photo: {
    beerId: number;
    url: string;
    thumbnailUrl: string;
    width: number;
    height: number;
  }): Promise<BeerPhoto> {
    const result = await this.pool.query<BeerPhotoRow>(
      `INSERT INTO beer_photo (url, thumbnail_url, width, height, beer_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${PHOTO_COLUMNS}`,
      [photo.url, photo.thumbnailUrl, photo.width, photo.height, photo.beerId],
    );
    return BeerPhoto.fromRow(result.rows[0]);
  }

  /** Renvoie les deux URLs de la ligne supprimée, nécessaires pour effacer les fichiers. */
  async deleteOneById(
    photoId: number,
    beerId: number,
  ): Promise<{ url: string; thumbnailUrl: string | null } | null> {
    const result = await this.pool.query<{
      url: string;
      thumbnail_url: string | null;
    }>(
      `DELETE FROM beer_photo WHERE id = $1 AND beer_id = $2 RETURNING url, thumbnail_url`,
      [photoId, beerId],
    );
    const row = result.rows[0];
    return row ? { url: row.url, thumbnailUrl: row.thumbnail_url } : null;
  }

  async beerExists(beerId: number): Promise<boolean> {
    const beer = await this.pool.query(`SELECT id FROM beer WHERE id = $1`, [
      beerId,
    ]);
    return beer.rows.length > 0;
  }
}
