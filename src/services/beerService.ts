import type { Beer } from "../models/beer.ts";
import type { BeerRepository } from "../repositories/beerRepository.ts";
import type { CreateBeerInput } from "../schemas/beerSchema.ts";

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
}
