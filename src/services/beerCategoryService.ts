import { ConflictError, NotFoundError } from "../errors/httpError.ts";
import type { Category } from "../models/category.ts";
import type { BeerCategoryRepository } from "../repositories/beerCategoryRepository.ts";
import type { CategoryRepository } from "../repositories/categoryRepository.ts";

export class BeerCategoryService {
  private readonly beerCategoryRepository: BeerCategoryRepository;
  private readonly categoryRepository: CategoryRepository;

  constructor(
    beerCategoryRepository: BeerCategoryRepository,
    categoryRepository: CategoryRepository,
  ) {
    this.beerCategoryRepository = beerCategoryRepository;
    this.categoryRepository = categoryRepository;
  }

  /**
   * Renvoie la catégorie associée (et non un simple {beerId, categoryId}) :
   * le front peut afficher son nom immédiatement, sans requête supplémentaire.
   */
  async addOne(beerId: number, categoryId: number): Promise<Category> {
    const beerExists = await this.beerCategoryRepository.beerExists(beerId);
    if (!beerExists) throw new NotFoundError("Bière non trouvée");

    const category = await this.categoryRepository.findOneById(categoryId);
    if (!category) throw new NotFoundError("Catégorie non trouvée");

    const alreadyAssociated =
      await this.beerCategoryRepository.associationExists(beerId, categoryId);
    if (alreadyAssociated) {
      throw new ConflictError("Cette catégorie est déjà associée à cette bière");
    }

    await this.beerCategoryRepository.addOne(beerId, categoryId);
    return category;
  }

  async deleteOneById(beerId: number, categoryId: number): Promise<void> {
    const deleted = await this.beerCategoryRepository.deleteOneById(
      beerId,
      categoryId,
    );
    if (!deleted) {
      throw new NotFoundError("Association catégorie/bière non trouvée");
    }
  }
}
