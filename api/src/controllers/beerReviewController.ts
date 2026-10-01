import type { Request, Response } from "express";
import type { User } from "../models/user.ts";
import type {
  BeerReviewParams,
  CreateBeerReviewInput,
  PatchBeerReviewInput,
} from "../schemas/beerReviewSchema.ts";
import type { BeerIdParam } from "../schemas/beerSchema.ts";
import type { BeerReviewService } from "../services/beerReviewService.ts";

export class BeerReviewController {
  private readonly beerReviewService: BeerReviewService;

  constructor(beerReviewService: BeerReviewService) {
    this.beerReviewService = beerReviewService;
  }

  getAllByBeerId = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
    const reviews = await this.beerReviewService.getAllByBeerId(beerId);
    res.status(200).json(reviews);
  };

  addOne = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId } = res.locals.params as BeerIdParam;
    const body = res.locals.body as CreateBeerReviewInput;
    // Déposé par le middleware authenticate : l'auteur vient du jeton, jamais du body
    const user = res.locals.user as User;
    const review = await this.beerReviewService.addOne(beerId, user, body);
    res.status(201).json(review);
  };

  updateOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId, reviewId } = res.locals.params as BeerReviewParams;
    const body = res.locals.body as PatchBeerReviewInput;
    const user = res.locals.user as User;
    const review = await this.beerReviewService.updateOneById(
      beerId,
      reviewId,
      user,
      body,
    );
    res.status(200).json(review);
  };

  deleteOneById = async (_req: Request, res: Response): Promise<void> => {
    const { id: beerId, reviewId } = res.locals.params as BeerReviewParams;
    const user = res.locals.user as User;
    await this.beerReviewService.deleteOneById(beerId, reviewId, user);
    res.status(204).send();
  };
}
