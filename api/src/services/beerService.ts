import { ConflictError, NotFoundError, BadRequestError } from "../errors/httpError.ts";
import type { Beer } from "../models/beer.ts";
import type { BeerRepository } from "../repositories/beerRepository.ts";
import type {
  CreateBeerInput,
  GetBeersQuery,
  PatchBeerInput,
} from "../schemas/beerSchema.ts";

export class BeerService {
  private readonly beerRepository: BeerRepository;

  constructor(beerRepository: BeerRepository) {
    this.beerRepository = beerRepository;
  }

  async getAll(query: GetBeersQuery): Promise<{
    data: Beer[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const { beers, total } = await this.beerRepository.findAll(query);
    return {
      data: beers,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async getOneById(beerId: number): Promise<Beer> {
    const beer = await this.beerRepository.findOneById(beerId);
    if (!beer) throw new NotFoundError("Bière non trouvée");
    return beer;
  }

  async deleteOneById(beerId: number): Promise<void> {
    const deleted = await this.beerRepository.deleteOneById(beerId);
    if (!deleted) throw new NotFoundError("Bière non trouvée");
  }

  async addOne(beerInput: CreateBeerInput): Promise<Beer> {
    const breweryExists = await this.beerRepository.breweryExists(
      beerInput.breweryId,
    );
    if (!breweryExists) throw new NotFoundError("Brasserie non trouvée");
    const beerNameExists = await this.beerRepository.beerNameExists(
      beerInput.name,
    );
    if (beerNameExists) {
      throw new ConflictError("Une bière de ce nom existe déjà");
    }
    return this.beerRepository.addOne(beerInput);
  }

  async updateOneById(
    beerId: number,
    patch: PatchBeerInput,
  ): Promise<Beer> {
    const currentBeer = await this.beerRepository.findOneById(beerId);
    if (!currentBeer) throw new NotFoundError("Bière non trouvée");

    if (patch.breweryId !== undefined) {
      const breweryExists = await this.beerRepository.breweryExists(
        patch.breweryId,
      );
      if (!breweryExists) throw new NotFoundError("Brasserie non trouvée");
    }

    if (patch.name !== undefined && patch.name !== currentBeer.name) {
      const nameExists = await this.beerRepository.beerNameExists(
        patch.name,
        beerId,
      );
      if (nameExists) {
        throw new ConflictError("Une bière de ce nom existe déjà");
      }
    }

    const mergedFields = {
      name: patch.name ?? currentBeer.name,
      description:
        patch.description !== undefined
          ? patch.description
          : currentBeer.description,
      price: patch.price ?? currentBeer.price,
      alcoholLevel: patch.alcoholLevel ?? currentBeer.alcoholLevel,
      isAlcoholFree: patch.isAlcoholFree ?? currentBeer.isAlcoholFree,
      breweryId: patch.breweryId ?? currentBeer.breweryId,
    };

    if (mergedFields.isAlcoholFree !== mergedFields.alcoholLevel < 0.5) {
      throw new BadRequestError(
        "isAlcoholFree doit correspondre au taux d'alcool (sans alcool si < 0.5%, avec alcool sinon)",
      );
    }

    const updatedBeer = await this.beerRepository.updateOneById(
      beerId,
      mergedFields,
    );
    if (!updatedBeer) {
      throw new Error("Erreur lors de la mise à jour de la bière");
    }
    return updatedBeer;
  }
}
