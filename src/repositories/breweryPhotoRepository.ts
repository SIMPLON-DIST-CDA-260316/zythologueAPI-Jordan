import type { Pool } from "pg";
import {
  BreweryPhoto,
  type BreweryPhotoRow,
} from "../models/breweryPhoto.ts";

const PHOTO_COLUMNS = `id, url, thumbnail_url, width, height, created_at, brewery_id`;

export class BreweryPhotoRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAllByBreweryId(breweryId: number): Promise<BreweryPhoto[]> {
    const result = await this.pool.query<BreweryPhotoRow>(
      `SELECT ${PHOTO_COLUMNS} FROM brewery_photo WHERE brewery_id = $1 ORDER BY created_at, id`,
      [breweryId],
    );
    return result.rows.map(BreweryPhoto.fromRow);
  }

  async findOneById(photoId: number): Promise<BreweryPhoto | null> {
    const result = await this.pool.query<BreweryPhotoRow>(
      `SELECT ${PHOTO_COLUMNS} FROM brewery_photo WHERE id = $1`,
      [photoId],
    );
    const row = result.rows[0];
    return row ? BreweryPhoto.fromRow(row) : null;
  }

  async countByBreweryId(breweryId: number): Promise<number> {
    const result = await this.pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM brewery_photo WHERE brewery_id = $1`,
      [breweryId],
    );
    return Number(result.rows[0].count);
  }

  async addOne(photo: {
    breweryId: number;
    url: string;
    thumbnailUrl: string;
    width: number;
    height: number;
  }): Promise<BreweryPhoto> {
    const result = await this.pool.query<BreweryPhotoRow>(
      `INSERT INTO brewery_photo (url, thumbnail_url, width, height, brewery_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${PHOTO_COLUMNS}`,
      [
        photo.url,
        photo.thumbnailUrl,
        photo.width,
        photo.height,
        photo.breweryId,
      ],
    );
    return BreweryPhoto.fromRow(result.rows[0]);
  }

  /** Renvoie les deux URLs de la ligne supprimée, nécessaires pour effacer les fichiers. */
  async deleteOneById(
    photoId: number,
    breweryId: number,
  ): Promise<{ url: string; thumbnailUrl: string | null } | null> {
    const result = await this.pool.query<{
      url: string;
      thumbnail_url: string | null;
    }>(
      `DELETE FROM brewery_photo WHERE id = $1 AND brewery_id = $2 RETURNING url, thumbnail_url`,
      [photoId, breweryId],
    );
    const row = result.rows[0];
    return row ? { url: row.url, thumbnailUrl: row.thumbnail_url } : null;
  }

  async breweryExists(breweryId: number): Promise<boolean> {
    const brewery = await this.pool.query(
      `SELECT id FROM brewery WHERE id = $1`,
      [breweryId],
    );
    return brewery.rows.length > 0;
  }
}
