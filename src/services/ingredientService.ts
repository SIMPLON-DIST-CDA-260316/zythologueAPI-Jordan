import { ConflictError, NotFoundError } from "../errors/httpError.ts";
import type { Ingredient } from "../models/ingredient.ts";
import type { IngredientRepository } from "../repositories/ingredientRepository.ts";
import type {
  CreateIngredientInput,
  GetIngredientsQuery,
  PatchIngredientInput,
} from "../schemas/ingredientSchema.ts";

export class IngredientService {
  private readonly ingredientRepository: IngredientRepository;

  constructor(ingredientRepository: IngredientRepository) {
    this.ingredientRepository = ingredientRepository;
  }

  async getAll(query: GetIngredientsQuery): Promise<{
    data: Ingredient[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const { ingredients, total } =
      await this.ingredientRepository.findAll(query);
    return {
      data: ingredients,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async getOneById(ingredientId: number): Promise<Ingredient> {
    const ingredient =
      await this.ingredientRepository.findOneById(ingredientId);
    if (!ingredient) throw new NotFoundError("Ingrédient non trouvé");
    return ingredient;
  }

  /**
   * Supprime l'ingrédient. Le ON DELETE CASCADE sur
   * beer_ingredient.ingredient_id s'occupe de désassocier les bières, aucun
   * nettoyage disque n'est requis (ingredient n'a pas de photos).
   */
  async deleteOneById(ingredientId: number): Promise<void> {
    const deleted =
      await this.ingredientRepository.deleteOneById(ingredientId);
    if (!deleted) throw new NotFoundError("Ingrédient non trouvé");
  }

  async addOne(ingredientInput: CreateIngredientInput): Promise<Ingredient> {
    const ingredientNameExists =
      await this.ingredientRepository.ingredientNameExists(
        ingredientInput.name,
      );
    if (ingredientNameExists) {
      throw new ConflictError("Un ingrédient de ce nom existe déjà");
    }
    return this.ingredientRepository.addOne(ingredientInput);
  }

  async updateOneById(
    ingredientId: number,
    patch: PatchIngredientInput,
  ): Promise<Ingredient> {
    const currentIngredient =
      await this.ingredientRepository.findOneById(ingredientId);
    if (!currentIngredient) throw new NotFoundError("Ingrédient non trouvé");

    if (patch.name !== undefined && patch.name !== currentIngredient.name) {
      const nameExists = await this.ingredientRepository.ingredientNameExists(
        patch.name,
        ingredientId,
      );
      if (nameExists) {
        throw new ConflictError("Un ingrédient de ce nom existe déjà");
      }
    }

    const mergedFields = {
      name: patch.name ?? currentIngredient.name,
      // description est nullable : on teste !== undefined pour qu'un null
      // explicite puisse effacer la valeur.
      description:
        patch.description !== undefined
          ? patch.description
          : currentIngredient.description,
    };

    const updatedIngredient = await this.ingredientRepository.updateOneById(
      ingredientId,
      mergedFields,
    );
    if (!updatedIngredient) {
      throw new Error("Erreur lors de la mise à jour de l'ingrédient");
    }
    return updatedIngredient;
  }
}
