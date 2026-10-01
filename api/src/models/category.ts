export interface CategoryRow {
  id: number;
  name: string;
  description: string;
}

export class Category {
  readonly id: number;
  readonly name: string;
  readonly description: string;

  constructor(id: number, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  static fromRow(row: CategoryRow): Category {
    return new Category(row.id, row.name, row.description);
  }
}
