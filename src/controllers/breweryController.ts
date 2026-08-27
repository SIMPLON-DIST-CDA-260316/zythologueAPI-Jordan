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
    try {
      const result = await this.breweryService.getAll(query);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  getOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: breweryId } = res.locals.params as BreweryIdParam;
    try {
      const brewery = await this.breweryService.getOneById(breweryId);
      if (!brewery) {
        res.status(404).json({ message: `Brasserie non trouvée` });
        return;
      }
      res.status(200).json(brewery);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: breweryId } = res.locals.params as BreweryIdParam;
    try {
      const deletedBrewery = await this.breweryService.deleteOneById(breweryId);
      if (!deletedBrewery) {
        res.status(404).json({ message: `Brasserie non trouvée` });
        return;
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  addOne = async (_req: Request, res: Response): Promise<void> => {
    const body = res.locals.body as CreateBreweryInput;
    try {
      const addedBrewery = await this.breweryService.addOne(body);
      if (addedBrewery === "NAME_ALREADY_EXISTS") {
        res
          .status(409)
          .json({ message: `Une brasserie de ce nom existe déjà` });
        return;
      }
      res.status(201).json(addedBrewery);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  updateOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: breweryId } = res.locals.params as BreweryIdParam;
    const body = res.locals.body as PatchBreweryInput;

    try {
      const updatedBrewery = await this.breweryService.updateOneById(
        breweryId,
        body,
      );
      switch (updatedBrewery) {
        case "BREWERY_NOT_FOUND":
          res.status(404).json({ message: `Brasserie non trouvée` });
          return;
        case "NAME_ALREADY_EXISTS":
          res
            .status(409)
            .json({ message: `Une brasserie de ce nom existe déjà` });
          return;
        default:
          res.status(200).json(updatedBrewery);
      }
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };
}
