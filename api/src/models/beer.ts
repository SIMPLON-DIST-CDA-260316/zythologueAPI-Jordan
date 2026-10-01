export interface BeerTag {
  id: number;
  name: string;
}

export interface BeerRow {
  id: number;
  name: string;
  description: string | null;
  price: string;
  alcohol_level: string;
  is_alcohol_free: boolean;
  breweryName: string;
  breweryId: number;
  // Absents des lignes de findAll (non sélectionnés) : seul findOneById les
  // renseigne, via un LEFT JOIN + json_agg côté SQL.
  categories?: BeerTag[];
  ingredients?: BeerTag[];
}

export class Beer {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly alcoholLevel: number;
  readonly isAlcoholFree: boolean;
  readonly breweryName: string;
  readonly breweryId: number;
  readonly categories?: BeerTag[];
  readonly ingredients?: BeerTag[];

  constructor(
    id: number,
    name: string,
    description: string | null,
    price: number,
    alcoholLevel: number,
    isAlcoholFree: boolean,
    breweryName: string,
    breweryId: number,
    categories?: BeerTag[],
    ingredients?: BeerTag[],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.alcoholLevel = alcoholLevel;
    this.isAlcoholFree = isAlcoholFree;
    this.breweryName = breweryName;
    this.breweryId = breweryId;
    this.categories = categories;
    this.ingredients = ingredients;
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
      row.breweryId,
      row.categories,
      row.ingredients,
    );
  }
}
