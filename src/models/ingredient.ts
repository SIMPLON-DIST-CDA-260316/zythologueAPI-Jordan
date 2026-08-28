export interface IngredientRow {
  id: number;
  name: string;
  description: string | null;
}

export class Ingredient {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;

  constructor(id: number, name: string, description: string | null) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  static fromRow(row: IngredientRow): Ingredient {
    return new Ingredient(row.id, row.name, row.description);
  }
}
