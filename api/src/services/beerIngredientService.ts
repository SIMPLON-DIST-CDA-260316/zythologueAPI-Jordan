import { ConflictError, NotFoundError } from "../errors/httpError.ts";
import type { Ingredient } from "../models/ingredient.ts";
import type { BeerIngredientRepository } from "../repositories/beerIngredientRepository.ts";
import type { IngredientRepository } from "../repositories/ingredientRepository.ts";

export class BeerIngredientService {
  private readonly beerIngredientRepository: BeerIngredientRepository;
  private readonly ingredientRepository: IngredientRepository;

  constructor(
    beerIngredientRepository: BeerIngredientRepository,
    ingredientRepository: IngredientRepository,
  ) {
    this.beerIngredientRepository = beerIngredientRepository;
    this.ingredientRepository = ingredientRepository;
  }

  /**
   * Renvoie l'ingrédient associé (et non un simple {beerId, ingredientId}) :
   * le front peut afficher son nom immédiatement, sans requête supplémentaire.
   */
  async addOne(beerId: number, ingredientId: number): Promise<Ingredient> {
    const beerExists = await this.beerIngredientRepository.beerExists(beerId);
    if (!beerExists) throw new NotFoundError("Bière non trouvée");

    const ingredient =
      await this.ingredientRepository.findOneById(ingredientId);
    if (!ingredient) throw new NotFoundError("Ingrédient non trouvé");

    const alreadyAssociated =
      await this.beerIngredientRepository.associationExists(
        beerId,
        ingredientId,
      );
    if (alreadyAssociated) {
      throw new ConflictError(
        "Cet ingrédient est déjà associé à cette bière",
      );
    }

    await this.beerIngredientRepository.addOne(beerId, ingredientId);
    return ingredient;
  }

  async deleteOneById(beerId: number, ingredientId: number): Promise<void> {
    const deleted = await this.beerIngredientRepository.deleteOneById(
      beerId,
      ingredientId,
    );
    if (!deleted) {
      throw new NotFoundError("Association ingrédient/bière non trouvée");
    }
  }
}
