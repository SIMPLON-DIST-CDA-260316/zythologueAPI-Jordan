import type { Request, Response } from "express";
import type {
  BreweryIdParam,
  CreateBreweryInput,
  GetBreweriesQuery,
  PatchBreweryInput,
} from "../schemas/brewerySchema.ts";
import type { BreweryService } from "../services/breweryService.ts";

export class BreweryController {
  private readonly breweryService: BreweryService;

  constructor(breweryService: BreweryService) {
    this.breweryService = breweryService;
  }

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.query as GetBreweriesQuery;
    const result = await this.breweryService.getAll(query);
    res.status(200).json(result);
  };

  getOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: breweryId } = res.locals.params as BreweryIdParam;
    const brewery = await this.breweryService.getOneById(breweryId);
    res.status(200).json(brewery);
  };

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: breweryId } = res.locals.params as BreweryIdParam;
    await this.breweryService.deleteOneById(breweryId);
    res.status(204).send();
  };

  addOne = async (_req: Request, res: Response): Promise<void> => {
    const body = res.locals.body as CreateBreweryInput;
    const addedBrewery = await this.breweryService.addOne(body);
    res.status(201).json(addedBrewery);
  };

  updateOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: breweryId } = res.locals.params as BreweryIdParam;
    const body = res.locals.body as PatchBreweryInput;
    const updatedBrewery = await this.breweryService.updateOneById(
      breweryId,
      body,
    );
    res.status(200).json(updatedBrewery);
  };
}
