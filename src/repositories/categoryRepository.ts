import type { Pool } from "pg";
import { Category, type CategoryRow } from "../models/category.ts";
import type { CreateCategoryInput } from "../schemas/categorySchema.ts";

const CATEGORY_SELECT = `id, name, description`;

export class CategoryRepository {
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
  }): Promise<{ categories: Category[]; total: number }> {
    const sortColumn = filters.sortBy === "name" ? "name" : "id";
    const direction = filters.order === "desc" ? "DESC" : "ASC";
    const offset = (filters.page - 1) * filters.limit;

    // COUNT(*) OVER() est évalué avant le LIMIT : il compte donc les
    // catégories filtrées, pas seulement celles renvoyées par la page.
    const result = await this.pool.query<CategoryRow & { total: string }>(
      `SELECT ${CATEGORY_SELECT}, COUNT(*) OVER() AS total
       FROM category
       WHERE ($1::text IS NULL OR name ILIKE '%' || $1 || '%')
       ORDER BY ${sortColumn} ${direction}
       LIMIT $2 OFFSET $3`,
      [filters.name ?? null, filters.limit, offset],
    );

    const total = result.rows[0] ? Number(result.rows[0].total) : 0;
    return { categories: result.rows.map(Category.fromRow), total };
  }

  async findOneById(categoryId: number): Promise<Category | null> {
    const result = await this.pool.query<CategoryRow>(
      `SELECT ${CATEGORY_SELECT} FROM category WHERE id = $1`,
      [categoryId],
    );
    const row = result.rows[0];
    return row ? Category.fromRow(row) : null;
  }

  async categoryNameExists(
    categoryName: string,
    excludeId?: number,
  ): Promise<boolean> {
    const category =
      excludeId !== undefined
        ? await this.pool.query(
            `SELECT id FROM category WHERE name = $1 AND id <> $2`,
            [categoryName, excludeId],
          )
        : await this.pool.query(`SELECT id FROM category WHERE name = $1`, [
            categoryName,
          ]);
    return category.rows.length > 0;
  }

  async addOne(categoryInput: CreateCategoryInput): Promise<Category> {
    const newCategory = await this.pool.query<{ id: number }>(
      `INSERT INTO category (name, description) VALUES ($1, $2) RETURNING id`,
      [categoryInput.name, categoryInput.description],
    );
    const addedCategory = await this.findOneById(newCategory.rows[0].id);
    if (!addedCategory) {
      throw new Error("Erreur lors de la création de la catégorie");
    }
    return addedCategory;
  }

  async updateOneById(
    categoryId: number,
    fields: { name: string; description: string },
  ): Promise<Category | null> {
    await this.pool.query(
      `UPDATE category SET name = $1, description = $2 WHERE id = $3`,
      [fields.name, fields.description, categoryId],
    );
    return this.findOneById(categoryId);
  }

  async deleteOneById(categoryId: number): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM category WHERE id = $1`,
      [categoryId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
