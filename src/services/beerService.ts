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
  ): Promise<Beer | "BREWERY_NOT_FOUND"> {
    const exists = await this.beerRepository.breweryExists(beerInput.breweryId);
    if (!exists) return "BREWERY_NOT_FOUND";
    return this.beerRepository.addOne(beerInput);
  }
}
