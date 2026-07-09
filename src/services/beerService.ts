import type { Beer } from "../models/beer.ts";
import type { BeerRepository } from "../repositories/beerRepository.ts";

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
}
