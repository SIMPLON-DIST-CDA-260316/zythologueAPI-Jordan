export interface BeerPhotoRow {
  id: number;
  url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  created_at: Date;
  beer_id: number;
}

export class BeerPhoto {
  readonly id: number;
  readonly url: string;
  readonly thumbnailUrl: string;
  readonly width: number | null;
  readonly height: number | null;
  readonly createdAt: Date;
  readonly beerId: number;

  constructor(
    id: number,
    url: string,
    thumbnailUrl: string,
    width: number | null,
    height: number | null,
    createdAt: Date,
    beerId: number,
  ) {
    this.id = id;
    this.url = url;
    this.thumbnailUrl = thumbnailUrl;
    this.width = width;
    this.height = height;
    this.createdAt = createdAt;
    this.beerId = beerId;
  }

  static fromRow(row: BeerPhotoRow): BeerPhoto {
    return new BeerPhoto(
      row.id,
      row.url,
      // Repli pour les photos importées sans variante générée (lignes du seed) :
      // le front reçoit toujours un thumbnailUrl exploitable.
      row.thumbnail_url ?? row.url,
      // width/height restent nullable : prétendre connaître les dimensions
      // d'une image externe serait pire que de renvoyer null.
      row.width,
      row.height,
      row.created_at,
      row.beer_id,
    );
  }
}
