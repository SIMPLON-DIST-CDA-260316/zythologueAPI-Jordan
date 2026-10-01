export interface BreweryPhotoRow {
  id: number;
  url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  created_at: Date;
  brewery_id: number;
}

export class BreweryPhoto {
  readonly id: number;
  readonly url: string;
  readonly thumbnailUrl: string;
  readonly width: number | null;
  readonly height: number | null;
  readonly createdAt: Date;
  readonly breweryId: number;

  constructor(
    id: number,
    url: string,
    thumbnailUrl: string,
    width: number | null,
    height: number | null,
    createdAt: Date,
    breweryId: number,
  ) {
    this.id = id;
    this.url = url;
    this.thumbnailUrl = thumbnailUrl;
    this.width = width;
    this.height = height;
    this.createdAt = createdAt;
    this.breweryId = breweryId;
  }

  static fromRow(row: BreweryPhotoRow): BreweryPhoto {
    return new BreweryPhoto(
      row.id,
      row.url,
      // Repli pour les photos importées sans variante générée (lignes du seed) :
      // le front reçoit toujours un thumbnailUrl exploitable.
      row.thumbnail_url ?? row.url,
      row.width,
      row.height,
      row.created_at,
      row.brewery_id,
    );
  }
}
