export interface BreweryRow {
  id: number;
  name: string;
  description: string;
  country: string;
  city: string;
  website: string | null;
  beerCount: string;
}

export class Brewery {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly country: string;
  readonly city: string;
  readonly website: string | null;
  readonly beerCount: number;

  constructor(
    id: number,
    name: string,
    description: string,
    country: string,
    city: string,
    website: string | null,
    beerCount: number,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.country = country;
    this.city = city;
    this.website = website;
    this.beerCount = beerCount;
  }

  static fromRow(row: BreweryRow): Brewery {
    return new Brewery(
      row.id,
      row.name,
      row.description,
      row.country,
      row.city,
      row.website,
      Number(row.beerCount),
    );
  }
}
