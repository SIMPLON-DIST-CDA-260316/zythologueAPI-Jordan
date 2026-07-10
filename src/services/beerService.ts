import type { Beer } from "../models/beer.ts";
import type { BeerRepository } from "../repositories/beerRepository.ts";
import type { CreateBeerInput, PatchBeerInput } from "../schemas/beerSchema.ts";

export class BeerService {
  private readonly beerRepository: BeerRepository;

  constructor(beerRepository: BeerRepository) {
    this.beerRepository = beerRepository;
  }

  async getAll(): Promise<Beer[]> {
    return this.beerRepository.findAll();
  }

  async getOneById(beerId: number): Promise<Beer | null> {
    return this.beerRepository.findOneById(beerId);
  }

  async deleteOneById(beerId: number): Promise<boolean> {
    return this.beerRepository.deleteOneById(beerId);
  }

  async addOne(
    beerInput: CreateBeerInput,
  ): Promise<Beer | "BREWERY_NOT_FOUND" | "NAME_ALREADY_EXISTS"> {
    const breweryExists = await this.beerRepository.breweryExists(
      beerInput.breweryId,
    );
    if (!breweryExists) return "BREWERY_NOT_FOUND";
    const beerNameExists = await this.beerRepository.beerNameExists(
      beerInput.name,
    );
    if (beerNameExists) return "NAME_ALREADY_EXISTS";
    return this.beerRepository.addOne(beerInput);
  }

  async updateOneById(
    beerId: number,
    patch: PatchBeerInput,
  ): Promise<
    | Beer
    | "BEER_NOT_FOUND"
    | "BREWERY_NOT_FOUND"
    | "NAME_ALREADY_EXISTS"
    | "INVALID_ALCOHOL_COHERENCE"
  > {
    const currentBeer = await this.beerRepository.findOneById(beerId);
    if (!currentBeer) return "BEER_NOT_FOUND";

    if (patch.breweryId !== undefined) {
      const breweryExists = await this.beerRepository.breweryExists(
        patch.breweryId,
      );
      if (!breweryExists) return "BREWERY_NOT_FOUND";
    }

    if (patch.name !== undefined && patch.name !== currentBeer.name) {
      const nameExists = await this.beerRepository.beerNameExists(
        patch.name,
        beerId,
      );
      if (nameExists) return "NAME_ALREADY_EXISTS";
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
      return "INVALID_ALCOHOL_COHERENCE";
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
