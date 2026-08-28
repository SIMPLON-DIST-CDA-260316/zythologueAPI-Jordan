import type { Pool } from "pg";
import { Ingredient, type IngredientRow } from "../models/ingredient.ts";
import type { CreateIngredientInput } from "../schemas/ingredientSchema.ts";

const INGREDIENT_SELECT = `id, name, description`;

export class IngredientRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(filters: {
    name?: string;
    sortBy?: "name";
    order: "asc" | "desc";
    page: number;
    limit: number;
  }): Promise<{ ingredients: Ingredient[]; total: number }> {
    const sortColumn = filters.sortBy === "name" ? "name" : "id";
    const direction = filters.order === "desc" ? "DESC" : "ASC";
    const offset = (filters.page - 1) * filters.limit;

    // COUNT(*) OVER() est évalué avant le LIMIT : il compte donc les
    // ingrédients filtrés, pas seulement ceux renvoyés par la page.
    const result = await this.pool.query<IngredientRow & { total: string }>(
      `SELECT ${INGREDIENT_SELECT}, COUNT(*) OVER() AS total
       FROM ingredient
       WHERE ($1::text IS NULL OR name ILIKE '%' || $1 || '%')
       ORDER BY ${sortColumn} ${direction}
       LIMIT $2 OFFSET $3`,
      [filters.name ?? null, filters.limit, offset],
    );

    const total = result.rows[0] ? Number(result.rows[0].total) : 0;
    return { ingredients: result.rows.map(Ingredient.fromRow), total };
  }

  async findOneById(ingredientId: number): Promise<Ingredient | null> {
    const result = await this.pool.query<IngredientRow>(
      `SELECT ${INGREDIENT_SELECT} FROM ingredient WHERE id = $1`,
      [ingredientId],
    );
    const row = result.rows[0];
    return row ? Ingredient.fromRow(row) : null;
  }

  async ingredientNameExists(
    ingredientName: string,
    excludeId?: number,
  ): Promise<boolean> {
    const ingredient =
      excludeId !== undefined
        ? await this.pool.query(
            `SELECT id FROM ingredient WHERE name = $1 AND id <> $2`,
            [ingredientName, excludeId],
          )
        : await this.pool.query(`SELECT id FROM ingredient WHERE name = $1`, [
            ingredientName,
          ]);
    return ingredient.rows.length > 0;
  }

  async addOne(ingredientInput: CreateIngredientInput): Promise<Ingredient> {
    const newIngredient = await this.pool.query<{ id: number }>(
      `INSERT INTO ingredient (name, description) VALUES ($1, $2) RETURNING id`,
      [ingredientInput.name, ingredientInput.description ?? null],
    );
    const addedIngredient = await this.findOneById(newIngredient.rows[0].id);
    if (!addedIngredient) {
      throw new Error("Erreur lors de la création de l'ingrédient");
    }
    return addedIngredient;
  }

  async updateOneById(
    ingredientId: number,
    fields: { name: string; description: string | null },
  ): Promise<Ingredient | null> {
    await this.pool.query(
      `UPDATE ingredient SET name = $1, description = $2 WHERE id = $3`,
      [fields.name, fields.description, ingredientId],
    );
    return this.findOneById(ingredientId);
  }

  async deleteOneById(ingredientId: number): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM ingredient WHERE id = $1`,
      [ingredientId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
