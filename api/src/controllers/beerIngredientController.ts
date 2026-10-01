import type { Request, Response } from "express";
import type { BeerIdParam } from "../schemas/beerSchema.ts";
import type {
  BeerIngredientParams,
  CreateBeerIngredientInput,
} from "../schemas/beerIngredientSchema.ts";
import type { BeerIngredientService } from "../services/beerIngredientService.ts";

export class BeerIngredientController {
  private readonly beerIngredientService: BeerIngredientService;

  constructor(beerIngredientService: BeerIngredientService) {
    this.beerIngredientService = beerIngredientService;
  }

  addOne = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
    const { ingredientId } = res.locals.body as CreateBeerIngredientInput;
    const ingredient = await this.beerIngredientService.addOne(
      beerId,
      ingredientId,
    );
    res.status(201).json(ingredient);
  };

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId, ingredientId } =
      res.locals.params as BeerIngredientParams;
    await this.beerIngredientService.deleteOneById(beerId, ingredientId);
    res.status(204).send();
  };
}
