import type { Request, Response } from "express";
import type { BeerIdParam } from "../schemas/beerSchema.ts";
import type {
  BeerCategoryParams,
  CreateBeerCategoryInput,
} from "../schemas/beerCategorySchema.ts";
import type { BeerCategoryService } from "../services/beerCategoryService.ts";

export class BeerCategoryController {
  private readonly beerCategoryService: BeerCategoryService;

  constructor(beerCategoryService: BeerCategoryService) {
    this.beerCategoryService = beerCategoryService;
  }

  addOne = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
    const { categoryId } = res.locals.body as CreateBeerCategoryInput;
    const category = await this.beerCategoryService.addOne(
      beerId,
      categoryId,
    );
    res.status(201).json(category);
  };

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId, categoryId } = res.locals.params as BeerCategoryParams;
    await this.beerCategoryService.deleteOneById(beerId, categoryId);
    res.status(204).send();
  };
}
