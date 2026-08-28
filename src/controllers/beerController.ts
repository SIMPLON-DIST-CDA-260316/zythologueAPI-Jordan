import type { Request, Response } from "express";
import type {
  BeerIdParam,
  CreateBeerInput,
  GetBeersQuery,
  PatchBeerInput,
} from "../schemas/beerSchema.ts";
import type { BeerService } from "../services/beerService.ts";

export class BeerController {
  private readonly beerService: BeerService;

  constructor(beerService: BeerService) {
    this.beerService = beerService;
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.query as GetBeersQuery;
    const result = await this.beerService.getAll(query);
    res.status(200).json(result);
  };

  getOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
    const beer = await this.beerService.getOneById(beerId);
    res.status(200).json(beer);
  };

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
    await this.beerService.deleteOneById(beerId);
    res.status(204).send();
  };

  addOne = async (_req: Request, res: Response): Promise<void> => {
    const body = res.locals.body as CreateBeerInput;
    const addedBeer = await this.beerService.addOne(body);
    res.status(201).json(addedBeer);
  };

  updateOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
    const body = res.locals.body as PatchBeerInput;
    const updatedBeer = await this.beerService.updateOneById(beerId, body);
    res.status(200).json(updatedBeer);
  };
}
