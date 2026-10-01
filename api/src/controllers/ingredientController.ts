import type { Request, Response } from "express";
import type {
  CreateIngredientInput,
  GetIngredientsQuery,
  IngredientIdParam,
  PatchIngredientInput,
} from "../schemas/ingredientSchema.ts";
import type { IngredientService } from "../services/ingredientService.ts";

export class IngredientController {
  private readonly ingredientService: IngredientService;

  constructor(ingredientService: IngredientService) {
    this.ingredientService = ingredientService;
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.query as GetIngredientsQuery;
    const result = await this.ingredientService.getAll(query);
    res.status(200).json(result);
  };

  getOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: ingredientId } = res.locals.params as IngredientIdParam;
    const ingredient = await this.ingredientService.getOneById(ingredientId);
    res.status(200).json(ingredient);
  };

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: ingredientId } = res.locals.params as IngredientIdParam;
    await this.ingredientService.deleteOneById(ingredientId);
    res.status(204).send();
  };

  addOne = async (_req: Request, res: Response): Promise<void> => {
    const body = res.locals.body as CreateIngredientInput;
    const addedIngredient = await this.ingredientService.addOne(body);
    res.status(201).json(addedIngredient);
  };

  updateOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: ingredientId } = res.locals.params as IngredientIdParam;
    const body = res.locals.body as PatchIngredientInput;
    const updatedIngredient = await this.ingredientService.updateOneById(
      ingredientId,
      body,
    );
    res.status(200).json(updatedIngredient);
  };
}
