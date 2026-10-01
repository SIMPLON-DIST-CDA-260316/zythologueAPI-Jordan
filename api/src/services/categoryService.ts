import { ConflictError, NotFoundError } from "../errors/httpError.ts";
import type { Category } from "../models/category.ts";
import type { CategoryRepository } from "../repositories/categoryRepository.ts";
import type {
  CreateCategoryInput,
  GetCategoriesQuery,
  PatchCategoryInput,
} from "../schemas/categorySchema.ts";

export class CategoryService {
  private readonly categoryRepository: CategoryRepository;

  constructor(categoryRepository: CategoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async getAll(query: GetCategoriesQuery): Promise<{
    data: Category[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const { categories, total } =
      await this.categoryRepository.findAll(query);
    return {
      data: categories,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async getOneById(categoryId: number): Promise<Category> {
    const category = await this.categoryRepository.findOneById(categoryId);
    if (!category) throw new NotFoundError("Catégorie non trouvée");
    return category;
  }

  /**
   * Supprime la catégorie. Le ON DELETE CASCADE sur beer_category.category_id
   * s'occupe de désassocier les bières, aucun nettoyage disque n'est requis
   * (contrairement à brewery, category n'a pas de photos).
   */
  async deleteOneById(categoryId: number): Promise<void> {
    const deleted = await this.categoryRepository.deleteOneById(categoryId);
    if (!deleted) throw new NotFoundError("Catégorie non trouvée");
  }

  async addOne(categoryInput: CreateCategoryInput): Promise<Category> {
    const categoryNameExists = await this.categoryRepository.categoryNameExists(
      categoryInput.name,
    );
    if (categoryNameExists) {
      throw new ConflictError("Une catégorie de ce nom existe déjà");
    }
    return this.categoryRepository.addOne(categoryInput);
  }

  async updateOneById(
    categoryId: number,
    patch: PatchCategoryInput,
  ): Promise<Category> {
    const currentCategory =
      await this.categoryRepository.findOneById(categoryId);
    if (!currentCategory) throw new NotFoundError("Catégorie non trouvée");

    if (patch.name !== undefined && patch.name !== currentCategory.name) {
      const nameExists = await this.categoryRepository.categoryNameExists(
        patch.name,
        categoryId,
      );
      if (nameExists) {
        throw new ConflictError("Une catégorie de ce nom existe déjà");
      }
    }

    const mergedFields = {
      name: patch.name ?? currentCategory.name,
      description: patch.description ?? currentCategory.description,
    };

    const updatedCategory = await this.categoryRepository.updateOneById(
      categoryId,
      mergedFields,
    );
    if (!updatedCategory) {
      throw new Error("Erreur lors de la mise à jour de la catégorie");
    }
    return updatedCategory;
  }
}
