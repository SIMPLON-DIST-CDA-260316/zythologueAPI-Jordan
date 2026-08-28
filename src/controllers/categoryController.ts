import type { Request, Response } from "express";
import type {
  CategoryIdParam,
  CreateCategoryInput,
  GetCategoriesQuery,
  PatchCategoryInput,
} from "../schemas/categorySchema.ts";
import type { CategoryService } from "../services/categoryService.ts";

export class CategoryController {
  private readonly categoryService: CategoryService;

  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.query as GetCategoriesQuery;
    const result = await this.categoryService.getAll(query);
    res.status(200).json(result);
  };

  getOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: categoryId } = res.locals.params as CategoryIdParam;
    const category = await this.categoryService.getOneById(categoryId);
    res.status(200).json(category);
  };

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: categoryId } = res.locals.params as CategoryIdParam;
    await this.categoryService.deleteOneById(categoryId);
    res.status(204).send();
  };

  addOne = async (_req: Request, res: Response): Promise<void> => {
    const body = res.locals.body as CreateCategoryInput;
    const addedCategory = await this.categoryService.addOne(body);
    res.status(201).json(addedCategory);
  };

  updateOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: categoryId } = res.locals.params as CategoryIdParam;
    const body = res.locals.body as PatchCategoryInput;
    const updatedCategory = await this.categoryService.updateOneById(
      categoryId,
      body,
    );
    res.status(200).json(updatedCategory);
  };
}
