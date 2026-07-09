export interface BeerRow {
  id: number;
  name: string;
  description: string | null;
  price: string;
  alcohol_level: string;
  is_alcohol_free: boolean;
  breweryName: string;
}

export class Beer {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly alcoholLevel: number;
  readonly isAlcoholFree: boolean;
  readonly breweryName: string;

  constructor(
    id: number,
    name: string,
    description: string | null,
    price: number,
    alcoholLevel: number,
    isAlcoholFree: boolean,
    breweryName: string,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.alcoholLevel = alcoholLevel;
    this.isAlcoholFree = isAlcoholFree;
    this.breweryName = breweryName;
  }

  static fromRow(row: BeerRow): Beer {
    return new Beer(
      row.id,
      row.name,
      row.description,
      Number(row.price),
      Number(row.alcohol_level),
      row.is_alcohol_free,
      row.breweryName,
    );
  }
}
